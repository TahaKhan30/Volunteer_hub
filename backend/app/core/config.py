from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "http://localhost:3000"

    ACCESS_TOKEN_COOKIE: str = "access_token"
    REFRESH_TOKEN_COOKIE: str = "refresh_token"
    # Local dev over http defaults to lax/non-secure; set COOKIE_SECURE=true and
    # COOKIE_SAMESITE=none in production (frontend + backend on different domains).
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    MAX_PHOTO_MB: int = 2
    MAX_RESUME_MB: int = 5

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        # Railway's Postgres plugin injects a plain "postgresql://" URL; asyncpg needs the
        # "postgresql+asyncpg://" driver prefix.
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL


settings = Settings()
