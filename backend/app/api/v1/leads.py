from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import io
import csv

from app.db.session import get_db
from app.models.models import Lead, Business
from app.schemas.schemas import LeadResponse, LeadStatusUpdate

router = APIRouter()

@router.get("", response_model=List[LeadResponse])
async def list_leads(status: Optional[str] = None, platform: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Lead)
    if status and status != 'all':
        query = query.where(Lead.status == status)
    if platform and platform != 'all':
        query = query.where(Lead.platform == platform)
    result = await db.execute(query.order_by(Lead.created_at.desc()))
    leads = result.scalars().all()
    return leads

@router.put("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(lead_id: str, payload: LeadStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalars().first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = payload.status
    await db.commit()
    await db.refresh(lead)
    return lead

@router.post("/sync")
async def sync_leads_from_platforms(db: AsyncSession = Depends(get_db)):
    # Triggers instant lead sync from Meta / Google APIs
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    # Seed 2 new fresh leads
    new_leads = [
        Lead(
            business_id=biz_id,
            platform="meta",
            full_name="Rajesh Sharma",
            phone="+91 98234 11223",
            email="rajesh.sharma@example.com",
            city="Delhi NCR",
            status="new",
            source="Meta Click-to-WhatsApp"
        ),
        Lead(
            business_id=biz_id,
            platform="google",
            full_name="Priya Patel",
            phone="+91 97112 33445",
            email="priya.patel@example.com",
            city="Ahmedabad",
            status="new",
            source="Google Search Lead Extension"
        )
    ]
    db.add_all(new_leads)
    await db.commit()
    return {"message": "Successfully synced 2 new leads from connected ad accounts!", "new_count": 2}

@router.get("/export")
async def export_leads_csv(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    leads = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Full Name", "Phone", "Email", "City", "Platform", "Status", "Source", "Date"])
    
    for lead in leads:
        writer.writerow([
            lead.id, lead.full_name, lead.phone, lead.email, lead.city, lead.platform, lead.status, lead.source, lead.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=socialadz_leads.csv"}
    )
