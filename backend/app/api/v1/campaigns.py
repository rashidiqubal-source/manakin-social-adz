from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Campaign, Business
from app.schemas.schemas import CampaignCreate, CampaignResponse, AIObjectiveRequest, AIObjectiveResponse

router = APIRouter()

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(platform: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Campaign)
    if platform:
        query = query.where(Campaign.platform == platform)
    result = await db.execute(query.order_by(Campaign.created_at.desc()))
    campaigns = result.scalars().all()
    return campaigns

@router.post("", response_model=CampaignResponse)
async def create_campaign(payload: CampaignCreate, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    new_campaign = Campaign(
        business_id=biz_id,
        platform=payload.platform,
        title=payload.title,
        objective=payload.objective,
        daily_budget=payload.daily_budget,
        total_budget=payload.total_budget,
        status="active",
        impressions=1200,
        clicks=85,
        spend=payload.daily_budget,
        leads_count=12,
        roas=4.2
    )
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    return new_campaign

@router.post("/ai-analyze", response_model=AIObjectiveResponse)
async def ai_analyze_objective(payload: AIObjectiveRequest):
    # Simulated AI Audience & Keyword Recommendation Engine
    desc_lower = payload.business_description.lower()
    
    score = 94
    suggested_audience = [
        "Online Shoppers (Age 22-45)",
        "Frequent E-Commerce Buyers in Metro Cities",
        "Engaged Shoppers Interested in Brands & Discounts",
        "High-Income Urban Professionals"
    ]
    recommended_keywords = [
        "#TrendingFashion", "#OnlineShoppingIndia", "#BestDeals", "#PremiumQuality", "#FreeShipping"
    ]
    estimated_reach = "180,000 - 450,000 People"
    estimated_leads = "120 - 320 Verified Enquiries / Month"
    ai_recommendation = f"Optimized campaign targeted at {payload.target_city} for goal: {payload.target_goal}. Suggested budget distribution: 60% Meta (FB/IG) for visuals & 40% Google Search for high-intent queries."

    return AIObjectiveResponse(
        score=score,
        suggested_audience=suggested_audience,
        recommended_keywords=recommended_keywords,
        estimated_reach=estimated_reach,
        estimated_leads=estimated_leads,
        ai_recommendation=ai_recommendation
    )
