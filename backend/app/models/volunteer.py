from datetime import date, datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, JSON, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

VOLUNTEER_STATUSES = ("active", "inactive", "suspended")


class Volunteer(Base):
    __tablename__ = "volunteers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Link back to original application
    application_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, unique=True
    )

    # Personal info (copied from application so volunteer record is self-contained)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)

    # Availability
    availability_start: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    availability_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Skills
    skills: Mapped[list] = mapped_column(JSON, default=list)
    talents_other: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Motivation
    motivation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Files
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Operational status
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Assignment period (set by admin at acceptance time)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Who accepted + when
    accepted_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    application: Mapped["Application | None"] = relationship("Application", back_populates="volunteer")  # noqa: F821
    acceptor: Mapped["User | None"] = relationship("User", foreign_keys=[accepted_by])  # noqa: F821
