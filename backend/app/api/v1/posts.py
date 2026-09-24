from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Post, Business
from app.schemas.schemas import PostCreate, PostResponse

router = APIRouter()

@router.get("", response_model=List[PostResponse])
async def list_posts(status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Post)
    if status and status != 'all':
        query = query.where(Post.status == status)
    result = await db.execute(query.order_by(Post.created_at.desc()))
    posts = result.scalars().all()
    return posts

@router.post("", response_model=PostResponse)
async def create_post(payload: PostCreate, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    new_post = Post(
        business_id=biz_id,
        platform=payload.platform,
        caption=payload.caption,
        media_url=payload.media_url or "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60",
        status=payload.status
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post
