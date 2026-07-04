import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from starlette.concurrency import run_in_threadpool
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

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
    result = await run_in_threadpool(
        cloudinary.uploader.upload,
        content,
        folder="volunteer-management/photos",
        resource_type="image",
    )
    return result["secure_url"]


async def save_resume(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(status_code=400, detail="Resume must be PDF or Word document.")
    content = await file.read()
    if len(content) > settings.MAX_RESUME_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Resume must be under {settings.MAX_RESUME_MB}MB.")
    result = await run_in_threadpool(
        cloudinary.uploader.upload,
        content,
        folder="volunteer-management/resumes",
        resource_type="raw",
    )
    return result["secure_url"]
