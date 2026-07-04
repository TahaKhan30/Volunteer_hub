from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    async with engine.begin() as conn:
        from app.models.user import User                    # noqa: F401
        from app.models.refresh_token import RefreshToken   # noqa: F401
        from app.models.application import Application      # noqa: F401
        from app.models.volunteer import Volunteer          # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
