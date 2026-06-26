from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = "http://localhost:3000"

    # Cookie names — centralised so frontend + backend always agree
    ACCESS_TOKEN_COOKIE: str = "access_token"
    REFRESH_TOKEN_COOKIE: str = "refresh_token"

    class Config:
        env_file = ".env"


settings = Settings()
