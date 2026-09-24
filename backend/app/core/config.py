import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Social Adz API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_SOCIALADZ_KEY_2026_CHANGE_IN_PROD"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # SQLite async for local dev
    DATABASE_URL: str = "sqlite+aiosqlite:///./socialadz.db"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # OAuth Application Credentials
    META_APP_ID: str = os.getenv("META_APP_ID", "mock_meta_app_id")
    META_APP_SECRET: str = os.getenv("META_APP_SECRET", "mock_meta_app_secret")

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "mock_google_client_id")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "mock_google_client_secret")

    SNAP_CLIENT_ID: str = os.getenv("SNAP_CLIENT_ID", "mock_snap_client_id")
    SNAP_CLIENT_SECRET: str = os.getenv("SNAP_CLIENT_SECRET", "mock_snap_client_secret")

    TWITTER_CLIENT_ID: str = os.getenv("TWITTER_CLIENT_ID", "mock_twitter_client_id")
    TWITTER_CLIENT_SECRET: str = os.getenv("TWITTER_CLIENT_SECRET", "mock_twitter_client_secret")

    class Config:
        case_sensitive = True

settings = Settings()
