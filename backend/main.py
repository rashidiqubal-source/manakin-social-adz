import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.api.v1 import auth, onboarding, dashboard, campaigns, posts, leads, analytics, billing, oauth
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(onboarding.router, prefix=f"{settings.API_V1_STR}/onboarding", tags=["Onboarding"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(campaigns.router, prefix=f"{settings.API_V1_STR}/campaigns", tags=["Campaigns"])
app.include_router(posts.router, prefix=f"{settings.API_V1_STR}/posts", tags=["Social Posts"])
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["Leads CRM"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(billing.router, prefix=f"{settings.API_V1_STR}/billing", tags=["Billing & Wallet"])
app.include_router(oauth.router, prefix=f"{settings.API_V1_STR}/oauth", tags=["OAuth Platform Connectors"])

@app.on_event("startup")
async def on_startup():
    print("🚀 Initializing Social Adz Backend & Database...")
    await init_db()
    print("✅ Database initialized successfully!")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
