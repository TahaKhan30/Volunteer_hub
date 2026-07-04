from datetime import datetime, date
from pydantic import BaseModel, EmailStr

VOLUNTEER_DURATION_OPTIONS = (
    "1 week", "2 weeks", "3 weeks", "4 weeks",
    "1 month", "2 months", "3 months", "6 months",
)


# ── Application schemas ───────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    country: str
    city: str
    availability_start: date | None = None
    availability_duration: str | None = None
    skills: list[str] = []
    talents_other: str | None = None
    motivation: str | None = None


class ApplicationReview(BaseModel):
    status: str       # "accepted" | "rejected" | "reviewing"
    admin_note: str | None = None
    start_date: date | None = None    # required when status == "accepted"
    duration: str | None = None       # required when status == "accepted"


class ApplicationResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: str
    country: str
    city: str
    availability_start: date | None
    availability_duration: str | None
    skills: list[str]
    talents_other: str | None
    motivation: str | None
    photo_path: str | None
    resume_path: str | None
    status: str
    admin_note: str | None
    reviewed_at: datetime | None
    submitted_at: datetime

    class Config:
        from_attributes = True


class ApplicationListItem(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    country: str
    city: str
    skills: list[str]
    photo_path: str | None
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True


# ── Volunteer schemas ─────────────────────────────────────────────────────────

class VolunteerUpdate(BaseModel):
    status: str | None = None
    phone: str | None = None
    city: str | None = None
    skills: list[str] | None = None
    end_date: date | None = None


class VolunteerResponse(BaseModel):
    id: int
    application_id: int | None
    email: str
    first_name: str
    last_name: str
    phone: str
    country: str
    city: str
    availability_start: date | None
    availability_duration: str | None
    skills: list[str]
    talents_other: str | None
    motivation: str | None
    photo_path: str | None
    resume_path: str | None
    status: str
    start_date: date
    end_date: date | None
    accepted_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class VolunteerListItem(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    country: str
    city: str
    skills: list[str]
    photo_path: str | None
    status: str
    start_date: date
    end_date: date | None
    accepted_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard stats ───────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int
    total_volunteers: int
    active_volunteers: int
