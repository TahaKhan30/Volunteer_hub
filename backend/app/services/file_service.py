import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from app.core.config import settings

ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_RESUME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


async def save_photo(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=400, detail="Photo must be JPG, PNG or WebP.")

    content = await file.read()
    if len(content) > settings.MAX_PHOTO_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Photo must be under {settings.MAX_PHOTO_MB}MB.")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"photo_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, "photos", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)

    async with aiofiles.open(path, "wb") as f:
        await f.write(content)

    return path


async def save_resume(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(status_code=400, detail="Resume must be PDF or Word document.")

    content = await file.read()
    if len(content) > settings.MAX_RESUME_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Resume must be under {settings.MAX_RESUME_MB}MB.")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"resume_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, "resumes", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)

    async with aiofiles.open(path, "wb") as f:
        await f.write(content)

    return path
