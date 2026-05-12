from fastapi import FastAPI
from fastapi import APIRouter, File, UploadFile

router = APIRouter(
    prefix="/api/image",
    tags=["image"]
)

