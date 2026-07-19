from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import Session

from app.core.database import engine
from app.repositories.nghi_viec_repo import NghiViecRepository
from app.services.phan_quyen_service import PhanQuyenService

scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()


def deactivate_employee_job(id_nhan_vien: str) -> None:
    """Deactivate an employee and revoke access when a resignation takes effect."""
    with Session(engine) as session:
        repo = NghiViecRepository(session)
        nhan_vien = repo.get_nhan_vien(id_nhan_vien)
        if nhan_vien is None:
            return
        # BR10-5: không xóa cứng hồ sơ, chỉ đổi trạng thái nghỉ việc.
        nhan_vien.trangThaiLamViec = 0
        repo.save_nhan_vien(nhan_vien)
        PhanQuyenService(session).revoke_all_roles(id_nhan_vien)


def schedule_employee_deactivation(id_nhan_vien: str, run_at: datetime) -> None:
    """Schedule resignation effect with an in-memory APScheduler job.

    TODO: APScheduler in-memory jobs are lost if the server restarts before
    run_at. For production, configure a persistent database job store and replay
    pending resignation decisions during application startup.
    """
    start_scheduler()
    scheduler.add_job(
        deactivate_employee_job,
        trigger="date",
        run_date=run_at,
        args=[id_nhan_vien],
        id=f"deactivate-{id_nhan_vien}-{run_at.isoformat()}",
        replace_existing=True,
    )
