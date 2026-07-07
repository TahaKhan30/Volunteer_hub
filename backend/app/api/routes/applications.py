import calendar
import json
import phonenumbers
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.application import Application
from app.models.volunteer import Volunteer
from app.models.user import User
from app.schemas.volunteer import (
    ApplicationResponse, ApplicationListItem, ApplicationReview, DashboardStats, VOLUNTEER_DURATION_OPTIONS,
)
from app.services.file_service import save_photo, save_resume
import csv, io

router = APIRouter(prefix="/api/applications", tags=["applications"])

_DURATION_WEEKS = {"1 week": 1, "2 weeks": 2, "3 weeks": 3, "4 weeks": 4}
_DURATION_MONTHS = {"1 month": 1, "2 months": 2, "3 months": 3, "6 months": 6}

# Real consumer email providers only — blocks throwaway/fake domains.
# Must match frontend ALLOWED_EMAIL_DOMAINS in lib/form-types.ts exactly.
ALLOWED_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
    "icloud.com", "me.com", "mac.com",
    "aol.com",
    "protonmail.com", "proton.me",
    "zoho.com",
    "gmx.com", "gmx.net",
    "mail.com",
    "yandex.com", "yandex.ru",
    "hey.com",
    "rediffmail.com",
}


def validate_email_domain(email: str) -> None:
    domain = email.rsplit("@", 1)[-1].lower() if "@" in email else ""
    if domain not in ALLOWED_EMAIL_DOMAINS:
        raise HTTPException(
            status_code=400,
            detail="Please use a real email provider (Gmail, Outlook, Yahoo, etc.)",
        )


def validate_phone(phone: str) -> None:
    try:
        parsed = phonenumbers.parse(phone, None)
    except phonenumbers.NumberParseException:
        raise HTTPException(status_code=400, detail="Enter a valid phone number")
    if not phonenumbers.is_valid_number(parsed):
        raise HTTPException(status_code=400, detail="Enter a valid phone number")


def compute_end_date(start: date, duration: str) -> date:
    if duration in _DURATION_WEEKS:
        return start + timedelta(weeks=_DURATION_WEEKS[duration])
    months = _DURATION_MONTHS[duration]
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


@router.post("", response_model=ApplicationResponse, status_code=201)
async def submit_application(
    email: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    country: str = Form(...),
    city: str = Form(...),
    availability_start: date | None = Form(None),
    availability_duration: str | None = Form(None),
    skills: str = Form("[]"),
    talents_other: str | None = Form(None),
    motivation: str | None = Form(None),
    photo: UploadFile | None = File(None),
    resume: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    validate_email_domain(email)
    validate_phone(phone)

    photo_path = None
    resume_path = None

    if photo and photo.filename:
        photo_path = await save_photo(photo)
    if resume and resume.filename:
        resume_path = await save_resume(resume)

    skills_list = json.loads(skills) if skills else []

    application = Application(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        country=country,
        city=city,
        availability_start=availability_start,
        availability_duration=availability_duration,
        skills=skills_list,
        talents_other=talents_other,
        motivation=motivation,
        photo_path=photo_path,
        resume_path=resume_path,
        status="pending",
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


@router.get("", response_model=list[ApplicationListItem])
async def list_applications(
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Application).order_by(Application.submitted_at.desc())
    if status:
        query = query.where(Application.status == status)
    if search:
        term = f"%{search.lower()}%"
        from sqlalchemy import or_, func as sqlfunc
        query = query.where(
            or_(
                sqlfunc.lower(Application.first_name).like(term),
                sqlfunc.lower(Application.last_name).like(term),
                sqlfunc.lower(Application.email).like(term),
                sqlfunc.lower(Application.country).like(term),
            )
        )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total_apps = await db.scalar(select(func.count(Application.id)))
    pending = await db.scalar(select(func.count(Application.id)).where(Application.status == "pending"))
    accepted = await db.scalar(select(func.count(Application.id)).where(Application.status == "accepted"))
    rejected = await db.scalar(select(func.count(Application.id)).where(Application.status == "rejected"))
    total_vols = await db.scalar(select(func.count(Volunteer.id)))
    active_vols = await db.scalar(select(func.count(Volunteer.id)).where(Volunteer.status == "active"))

    return DashboardStats(
        total_applications=total_apps or 0,
        pending_applications=pending or 0,
        accepted_applications=accepted or 0,
        rejected_applications=rejected or 0,
        total_volunteers=total_vols or 0,
        active_volunteers=active_vols or 0,
    )


@router.get("/export")
async def export_applications(
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Application).order_by(Application.submitted_at.desc())
    if status:
        query = query.where(Application.status == status)
    result = await db.execute(query)
    apps = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "First name", "Last name", "Email", "Phone", "Country", "City",
                     "Available from", "Duration", "Skills", "Motivation", "Status", "Submitted at"])
    for a in apps:
        writer.writerow([
            a.id, a.first_name, a.last_name, a.email, a.phone, a.country, a.city,
            a.availability_start, a.availability_duration,
            ", ".join(a.skills or []), a.motivation or "", a.status,
            a.submitted_at.strftime("%Y-%m-%d %H:%M"),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"}
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.patch("/{application_id}/review", response_model=ApplicationResponse)
async def review_application(
    application_id: int,
    body: ApplicationReview,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    valid_statuses = ("pending", "reviewing", "accepted", "rejected")
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    if body.status == "accepted":
        if not body.start_date or not body.duration:
            raise HTTPException(
                status_code=400,
                detail="start_date and duration are required to accept an application",
            )
        if body.duration not in VOLUNTEER_DURATION_OPTIONS:
            raise HTTPException(
                status_code=400,
                detail=f"duration must be one of {VOLUNTEER_DURATION_OPTIONS}",
            )

    app.status = body.status
    app.admin_note = body.admin_note
    app.reviewed_by = current_user.id
    app.reviewed_at = datetime.now(timezone.utc)

    # If accepted, create volunteer record
    existing_volunteer = await db.scalar(
        select(Volunteer).where(Volunteer.application_id == app.id)
    )
    if body.status == "accepted" and not existing_volunteer:
        volunteer = Volunteer(
            application_id=app.id,
            email=app.email,
            first_name=app.first_name,
            last_name=app.last_name,
            phone=app.phone,
            country=app.country,
            city=app.city,
            availability_start=app.availability_start,
            availability_duration=app.availability_duration,
            skills=app.skills,
            talents_other=app.talents_other,
            motivation=app.motivation,
            photo_path=app.photo_path,
            resume_path=app.resume_path,
            status="active",
            start_date=body.start_date,
            end_date=compute_end_date(body.start_date, body.duration),
            accepted_by=current_user.id,
        )
        db.add(volunteer)

    await db.commit()
    await db.refresh(app)
    return app
