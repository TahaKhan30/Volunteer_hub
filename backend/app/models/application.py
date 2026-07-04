from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, JSON, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

# Status flow: pending → reviewing → accepted | rejected
APPLICATION_STATUSES = ("pending", "reviewing", "accepted", "rejected")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Personal info
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)

    # Availability
    availability_start: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    availability_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Skills (JSON arrays)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    talents_other: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Motivation
    motivation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Uploaded files (paths on disk)
    photo_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Review
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    reviewer: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by])  # noqa: F821
    volunteer: Mapped["Volunteer | None"] = relationship("Volunteer", back_populates="application", uselist=False)  # noqa: F821
