from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base_class import Base

class BlogPost(Base):
    """
    Modelo para posts del blog
    """
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    author_id = Column(String(255), nullable=False, index=True)  # Firebase UID
    author_name = Column(String(255), nullable=False)
    author_alias = Column(String(255), nullable=False)
    published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<BlogPost(id={self.id}, title='{self.title}', slug='{self.slug}')>"

class PostLike(Base):
    """
    Modelo para likes de posts del blog
    """
    __tablename__ = "post_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)  # Firebase UID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    post = relationship("BlogPost", back_populates="likes")
    
    # Constraint único para evitar likes duplicados
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='unique_post_user_like'),
    )
    
    def __repr__(self):
        return f"<PostLike(id={self.id}, post_id={self.post_id}, user_id='{self.user_id}')>"

# TODO: Implementar funcionalidad completa de likes
# - Endpoint POST /api/v1/blog/{post_id}/like (idempotente)
# - Rate limiting: 1 like por usuario/IP cada 10 segundos
# - Métrica Prometheus: blog_post_likes_total{post_id}
# - Visibilidad pública del contador en endpoint de post
# - Ticket en backlog para implementación completa 