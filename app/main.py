"""FastAPI entrypoint for the HiCAS HRM backend foundation."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.core.scheduler import start_scheduler
from app.routers import (
    auth_router,
    bao_cao_router,
    cham_cong_router,
    danh_muc_router,
    ho_so_ca_nhan_router,
    ho_so_router,
    nghi_phep_router,
    nghi_viec_router,
    phe_duyet_router,
    phan_quyen_router,
    tai_san_router,
    thong_bao_router,
)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_ROOT = Path("uploads")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")


@app.on_event("startup")
def on_startup() -> None:
    if settings.ENVIRONMENT == "dev":
        init_db()
    start_scheduler()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router.router)
app.include_router(ho_so_router.router)
app.include_router(phe_duyet_router.router)
app.include_router(phan_quyen_router.router)
app.include_router(danh_muc_router.router)
app.include_router(ho_so_ca_nhan_router.router)
app.include_router(nghi_viec_router.router)
app.include_router(cham_cong_router.router)
app.include_router(nghi_phep_router.router)
app.include_router(thong_bao_router.router)
app.include_router(tai_san_router.router)
app.include_router(bao_cao_router.router)
