import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.volunteer import Volunteer
from app.models.user import User
from app.schemas.volunteer import VolunteerResponse, VolunteerListItem, VolunteerUpdate

router = APIRouter(prefix="/api/volunteers", tags=["volunteers"])


@router.get("", response_model=list[VolunteerListItem])
async def list_volunteers(
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Volunteer).order_by(Volunteer.accepted_at.desc())
    if status:
        query = query.where(Volunteer.status == status)
    if search:
        term = f"%{search.lower()}%"
        from sqlalchemy import or_, func
        query = query.where(
            or_(
                func.lower(Volunteer.first_name).like(term),
                func.lower(Volunteer.last_name).like(term),
                func.lower(Volunteer.email).like(term),
                func.lower(Volunteer.country).like(term),
            )
        )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/export")
async def export_volunteers(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Volunteer).order_by(Volunteer.accepted_at.desc()))
    vols = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "First name", "Last name", "Email", "Phone", "Country", "City",
                     "Skills", "Status", "Start date", "End date", "Accepted at"])
    for v in vols:
        writer.writerow([
            v.id, v.first_name, v.last_name, v.email, v.phone, v.country, v.city,
            ", ".join(v.skills or []), v.status,
            v.start_date.strftime("%Y-%m-%d"), v.end_date.strftime("%Y-%m-%d") if v.end_date else "",
            v.accepted_at.strftime("%Y-%m-%d %H:%M"),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=volunteers.csv"}
    )


@router.get("/{volunteer_id}", response_model=VolunteerResponse)
async def get_volunteer(
    volunteer_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    vol = result.scalar_one_or_none()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return vol


@router.patch("/{volunteer_id}", response_model=VolunteerResponse)
async def update_volunteer(
    volunteer_id: int,
    body: VolunteerUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    vol = result.scalar_one_or_none()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    if body.status is not None:
        valid = ("active", "inactive", "suspended")
        if body.status not in valid:
            raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
        vol.status = body.status
    if body.phone is not None:
        vol.phone = body.phone
    if body.city is not None:
        vol.city = body.city
    if body.skills is not None:
        vol.skills = body.skills
    if body.end_date is not None:
        vol.end_date = body.end_date

    await db.commit()
    await db.refresh(vol)
    return vol
