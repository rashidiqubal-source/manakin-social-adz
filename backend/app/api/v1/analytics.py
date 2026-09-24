from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.models import Campaign

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview(period: str = "7d", db: AsyncSession = Depends(get_db)):
    # Generates trend chart series data for Recharts
    trend_data = [
        {"date": "Mon", "impressions": 12400, "clicks": 820, "spend": 3200, "leads": 22},
        {"date": "Tue", "impressions": 15800, "clicks": 1050, "spend": 4100, "leads": 29},
        {"date": "Wed", "impressions": 14200, "clicks": 940, "spend": 3800, "leads": 25},
        {"date": "Thu", "impressions": 19500, "clicks": 1310, "spend": 5200, "leads": 38},
        {"date": "Fri", "impressions": 22100, "clicks": 1480, "spend": 6000, "leads": 42},
        {"date": "Sat", "impressions": 24800, "clicks": 1690, "spend": 6800, "leads": 48},
        {"date": "Sun", "impressions": 21000, "clicks": 1410, "spend": 5400, "leads": 36},
    ]

    platform_breakdown = [
        {"name": "Meta (FB & IG)", "spend": 14500, "leads": 98, "share": "58%"},
        {"name": "Google Ads", "spend": 7500, "leads": 42, "share": "30%"},
        {"name": "Snapchat Ads", "spend": 1800, "leads": 12, "share": "7%"},
        {"name": "X / Twitter Ads", "spend": 1200, "leads": 8, "share": "5%"},
    ]

    return {
        "period": period,
        "trend_data": trend_data,
        "platform_breakdown": platform_breakdown,
        "metrics_summary": {
            "total_impressions": 129800,
            "total_clicks": 8700,
            "ctr": "6.7%",
            "total_spend": 34500.0,
            "total_leads": 240,
            "avg_cpl": 143.75,
            "avg_roas": 4.1
        }
    }
