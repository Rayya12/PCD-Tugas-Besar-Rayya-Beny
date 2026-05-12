from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import image


app = FastAPI(
    title= "Image Editor API",
    description = "Simple Photoshop-like Image processing API",
    version = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image.router, prefix="/api/image", tags=["image"])

@app.get("/")
def read_root():
    return {"Hello": "World"}





