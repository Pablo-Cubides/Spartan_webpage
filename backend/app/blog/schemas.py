from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BlogPostBase(BaseModel):
    """Schema base para posts del blog"""
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = None
    published: bool = False

class BlogPostCreate(BlogPostBase):
    """Schema para crear un post"""
    pass

class BlogPostUpdate(BaseModel):
    """Schema para actualizar un post"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = None
    published: Optional[bool] = None

class BlogPostResponse(BlogPostBase):
    """Schema para respuesta de post"""
    id: int
    author_id: str
    author_name: str
    author_alias: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    likes_count: int = 0  # Contador público de likes
    
    class Config:
        from_attributes = True

class PostLikeCreate(BaseModel):
    """Schema para crear un like"""
    post_id: int = Field(..., gt=0)
    user_id: str = Field(..., min_length=1)

class PostLikeResponse(BaseModel):
    """Schema para respuesta de like"""
    id: int
    post_id: int
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BlogPostListResponse(BaseModel):
    """Schema para lista de posts"""
    posts: List[BlogPostResponse]
    total: int
    page: int
    limit: int
    pages: int

# TODO: Implementar endpoints completos para likes
# - POST /api/v1/blog/{post_id}/like (idempotente)
# - GET /api/v1/blog/{post_id}/likes (lista de likes)
# - DELETE /api/v1/blog/{post_id}/like (quitar like)
# - Rate limiting implementado
# - Métricas Prometheus configuradas 