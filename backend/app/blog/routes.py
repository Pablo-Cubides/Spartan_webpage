from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from ..core.database import get_db
from ..core.firebase_auth import get_current_user
from ..core.rate_limiting import rate_limit
from ..core.metrics import metrics_collector
from ..core.cache import get_cache, set_cache, delete_cache
from .models import BlogPost, PostLike
from .schemas import (
    BlogPostCreate, BlogPostUpdate, BlogPostResponse,
    PostLikeCreate, PostLikeResponse, BlogPostListResponse
)
from ..core.logging_config import log_business_operation, log_error
from ..core.sentry_config import capture_exception
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/blog", tags=["Blog"])

# ========================================
# POSTS DEL BLOG
# ========================================

@router.get("/posts", response_model=BlogPostListResponse)
async def get_blog_posts(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=50, description="Elementos por página"),
    published_only: bool = Query(True, description="Solo posts publicados"),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener lista de posts del blog con contador de likes
    """
    try:
        # Construir query base
        query = select(BlogPost)
        
        if published_only:
            query = query.where(BlogPost.published == True)
        
        # Contar total
        count_query = select(func.count(BlogPost.id))
        if published_only:
            count_query = count_query.where(BlogPost.published == True)
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Paginación
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(BlogPost.created_at.desc())
        
        # Ejecutar query con likes count
        result = await db.execute(query)
        posts = result.scalars().all()
        
        # Obtener contadores de likes para cada post
        posts_with_likes = []
        for post in posts:
            # Intentar obtener del cache primero
            cache_key = f"post_likes_count:{post.id}"
            likes_count = await get_cache(cache_key)
            
            if likes_count is None:
                # Contar desde DB
                likes_query = select(func.count(PostLike.id)).where(PostLike.post_id == post.id)
                likes_result = await db.execute(likes_query)
                likes_count = likes_result.scalar()
                
                # Cache por 5 minutos
                await set_cache(cache_key, likes_count, ttl=300)
            
            # Crear respuesta con likes count
            post_dict = {
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "content": post.content,
                "excerpt": post.excerpt,
                "author_id": post.author_id,
                "author_name": post.author_name,
                "author_alias": post.author_alias,
                "published": post.published,
                "published_at": post.published_at,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
                "likes_count": likes_count
            }
            posts_with_likes.append(BlogPostResponse(**post_dict))
        
        pages = (total + limit - 1) // limit
        
        return BlogPostListResponse(
            posts=posts_with_likes,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
        
    except Exception as e:
        log_error(e, "get_blog_posts")
        capture_exception(e)
        raise HTTPException(status_code=500, detail="Error obteniendo posts")

@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener un post específico del blog con contador de likes
    """
    try:
        # Buscar post
        query = select(BlogPost).where(BlogPost.id == post_id)
        result = await db.execute(query)
        post = result.scalar_one_or_none()
        
        if not post:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        
        # Obtener contador de likes
        cache_key = f"post_likes_count:{post.id}"
        likes_count = await get_cache(cache_key)
        
        if likes_count is None:
            likes_query = select(func.count(PostLike.id)).where(PostLike.post_id == post.id)
            likes_result = await db.execute(likes_query)
            likes_count = likes_result.scalar()
            await set_cache(cache_key, likes_count, ttl=300)
        
        # Crear respuesta
        post_dict = {
            "id": post.id,
            "title": post.title,
            "slug": post.slug,
            "content": post.content,
            "excerpt": post.excerpt,
            "author_id": post.author_id,
            "author_name": post.author_name,
            "author_alias": post.author_alias,
            "published": post.published,
            "published_at": post.published_at,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "likes_count": likes_count
        }
        
        return BlogPostResponse(**post_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_blog_post", post_id=post_id)
        capture_exception(e)
        raise HTTPException(status_code=500, detail="Error obteniendo post")

# ========================================
# LIKES - IMPLEMENTACIÓN COMPLETA
# ========================================

@router.post("/{post_id}/like", response_model=PostLikeResponse)
@rate_limit(max_requests=1, window_seconds=10)  # 1 like cada 10 segundos
async def like_post(
    post_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """
    Dar like a un post (idempotente)
    """
    try:
        # Verificar que el post existe
        post_query = select(BlogPost).where(BlogPost.id == post_id)
        post_result = await db.execute(post_query)
        post = post_result.scalar_one_or_none()
        
        if not post:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        
        user_id = current_user['uid']
        
        # Verificar si ya existe el like
        existing_like_query = select(PostLike).where(
            and_(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
        existing_result = await db.execute(existing_like_query)
        existing_like = existing_result.scalar_one_or_none()
        
        if existing_like:
            # Like ya existe, retornar el existente (idempotente)
            return PostLikeResponse(
                id=existing_like.id,
                post_id=existing_like.post_id,
                user_id=existing_like.user_id,
                created_at=existing_like.created_at
            )
        
        # Crear nuevo like
        new_like = PostLike(
            post_id=post_id,
            user_id=user_id
        )
        
        db.add(new_like)
        await db.commit()
        await db.refresh(new_like)
        
        # Invalidar cache de likes count
        cache_key = f"post_likes_count:{post_id}"
        await delete_cache(cache_key)
        
        # Registrar métrica Prometheus
        if metrics_collector:
            metrics_collector.increment_counter("blog_post_likes_total", {"post_id": str(post_id)})
        
        # Log de operación de negocio
        log_business_operation(
            operation="post_liked",
            user_id=user_id,
            post_id=post_id
        )
        
        # Tarea en background para notificación push (si está habilitada)
        if background_tasks:
            background_tasks.add_task(
                send_like_notification,
                post_id=post_id,
                user_id=user_id,
                post_title=post.title
            )
        
        return PostLikeResponse(
            id=new_like.id,
            post_id=new_like.post_id,
            user_id=new_like.user_id,
            created_at=new_like.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "like_post", user_id=current_user['uid'], post_id=post_id)
        capture_exception(e, user_id=current_user['uid'], post_id=post_id)
        raise HTTPException(status_code=500, detail="Error procesando like")

@router.delete("/{post_id}/like")
@rate_limit(max_requests=1, window_seconds=10)
async def unlike_post(
    post_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Quitar like de un post
    """
    try:
        user_id = current_user['uid']
        
        # Buscar el like
        like_query = select(PostLike).where(
            and_(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
        like_result = await db.execute(like_query)
        like = like_result.scalar_one_or_none()
        
        if not like:
            raise HTTPException(status_code=404, detail="Like no encontrado")
        
        # Eliminar like
        await db.delete(like)
        await db.commit()
        
        # Invalidar cache de likes count
        cache_key = f"post_likes_count:{post_id}"
        await delete_cache(cache_key)
        
        # Registrar métrica Prometheus
        if metrics_collector:
            metrics_collector.increment_counter("blog_post_unlikes_total", {"post_id": str(post_id)})
        
        # Log de operación de negocio
        log_business_operation(
            operation="post_unliked",
            user_id=user_id,
            post_id=post_id
        )
        
        return {"message": "Like eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "unlike_post", user_id=current_user['uid'], post_id=post_id)
        capture_exception(e, user_id=current_user['uid'], post_id=post_id)
        raise HTTPException(status_code=500, detail="Error procesando unlike")

@router.get("/{post_id}/likes", response_model=List[PostLikeResponse])
async def get_post_likes(
    post_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener lista de likes de un post
    """
    try:
        # Verificar que el post existe
        post_query = select(BlogPost).where(BlogPost.id == post_id)
        post_result = await db.execute(post_query)
        post = post_result.scalar_one_or_none()
        
        if not post:
            raise HTTPException(status_code=404, detail="Post no encontrado")
        
        # Contar total de likes
        count_query = select(func.count(PostLike.id)).where(PostLike.post_id == post_id)
        count_result = await db.execute(count_query)
        total = count_result.scalar()
        
        # Paginación
        offset = (page - 1) * limit
        likes_query = select(PostLike).where(PostLike.post_id == post_id)\
            .order_by(PostLike.created_at.desc())\
            .offset(offset).limit(limit)
        
        likes_result = await db.execute(likes_query)
        likes = likes_result.scalars().all()
        
        return [
            PostLikeResponse(
                id=like.id,
                post_id=like.post_id,
                user_id=like.user_id,
                created_at=like.created_at
            )
            for like in likes
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "get_post_likes", post_id=post_id)
        capture_exception(e, post_id=post_id)
        raise HTTPException(status_code=500, detail="Error obteniendo likes")

# ========================================
# FUNCIONES AUXILIARES
# ========================================

async def send_like_notification(post_id: int, user_id: str, post_title: str):
    """
    Enviar notificación push cuando alguien da like (background task)
    """
    try:
        # TODO: Implementar notificación push con Firebase Cloud Messaging
        logger.info(f"Like notification for post {post_id} by user {user_id}")
        
        # Aquí se implementaría la lógica de notificación push
        # await send_push_notification(
        #     user_id=post_author_id,
        #     title="Nuevo like en tu post",
        #     body=f"@{user_alias} dio like a tu post '{post_title}'"
        # )
        
    except Exception as e:
        logger.error(f"Error sending like notification: {e}")
        capture_exception(e)

# ========================================
# MÉTRICAS Y MONITOREO
# ========================================

@router.get("/metrics/likes")
async def get_likes_metrics():
    """
    Obtener métricas de likes para dashboard
    """
    try:
        # TODO: Implementar métricas agregadas
        # - Total de likes por día
        # - Posts más populares
        # - Actividad de usuarios
        
        return {
            "total_likes": 0,
            "likes_today": 0,
            "most_liked_posts": [],
            "active_users": 0
        }
        
    except Exception as e:
        log_error(e, "get_likes_metrics")
        capture_exception(e)
        raise HTTPException(status_code=500, detail="Error obteniendo métricas") 