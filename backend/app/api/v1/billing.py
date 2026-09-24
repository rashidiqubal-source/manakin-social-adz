from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Transaction, Business
from app.schemas.schemas import TransactionResponse

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).order_by(Transaction.created_at.desc()))
    transactions = result.scalars().all()
    return transactions

@router.post("/add-funds")
async def add_wallet_funds(amount: float = 5000.0, db: AsyncSession = Depends(get_db)):
    biz_result = await db.execute(select(Business).limit(1))
    biz = biz_result.scalars().first()
    biz_id = biz.id if biz else "demo-biz-id"

    tx = Transaction(
        business_id=biz_id,
        amount=amount,
        currency="INR",
        platform="UPI / Razorpay",
        status="paid",
        description=f"Added ₹{amount:,.2f} to Ad Wallet via UPI Instant Pay",
        invoice_url="https://socialadz.co/invoices/INV-2026-9042.pdf"
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return {"message": f"Successfully recharged wallet with ₹{amount:,.2f}!", "transaction_id": tx.id}
