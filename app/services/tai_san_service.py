import logging
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.rbac import ADMIN_ROLE_IDS, HCNS_ROLE_IDS
from app.models.giao_nhan_tai_san import GiaoNhanTaiSan
from app.models.tai_khoan import TaiKhoan
from app.repositories.giao_nhan_tai_san_repo import GiaoNhanTaiSanRepository
from app.repositories.tai_san_repo import TaiSanRepository
from app.schemas.tai_san_schema import (
    CapPhatItemResponse,
    CapPhatRequest,
    LichSuLuanChuyenItem,
    ThuHoiRequest,
    ThuHoiResponse,
)
from app.services.thong_bao_service import MANAGER_ROLE_IDS

logger = logging.getLogger(__name__)
HIGH_VALUE_ASSET_THRESHOLD = Decimal("10000000")


class TaiSanService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.tai_san_repo = TaiSanRepository(session)
        self.giao_nhan_repo = GiaoNhanTaiSanRepository(session)

    def cap_phat(
        self,
        payload: CapPhatRequest,
        current_user: TaiKhoan,
    ) -> list[CapPhatItemResponse]:
        """UC26: assign one or more available assets to one employee in a single transaction."""
        self._assert_can_manage_assets(current_user)
        if self.tai_san_repo.get_nhan_vien(payload.id_nhan_vien) is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy nhân viên nhận tài sản")
        if len(set(payload.id_tai_san_list)) != len(payload.id_tai_san_list):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Danh sách tài sản cấp phát bị trùng")

        created: list[GiaoNhanTaiSan] = []
        try:
            for id_tai_san in payload.id_tai_san_list:
                tai_san = self.tai_san_repo.get(id_tai_san, for_update=True)
                if tai_san is None:
                    raise HTTPException(status.HTTP_404_NOT_FOUND, f"Không tìm thấy tài sản {id_tai_san}")
                # BR26-2: chỉ cấp phát tài sản đang sẵn sàng, không cấp 1 tài sản cho nhiều nhân sự.
                if tai_san.trangThai != 1:
                    raise HTTPException(
                        status.HTTP_409_CONFLICT,
                        f"Tài sản {id_tai_san} đã được cấp phát, vui lòng tải lại dữ liệu",
                    )
                tai_san.trangThai = 0
                self.tai_san_repo.save(tai_san, commit=False)
                # BR26-1: tình trạng phần cứng/phụ kiện đi kèm lưu dạng text trong tinhTrangBanGiao.
                giao_nhan = GiaoNhanTaiSan(
                    id_GiaoNhan=f"GNTS-{uuid4().hex[:12]}",
                    ngayCapPhat=payload.ngay_cap_phat,
                    tinhTrangBanGiao=payload.tinh_trang_ban_giao,
                    tinhTrangThuHoi=None,
                    tepBienBan=None,
                    ngayThuHoi=None,
                    trangThai=1,
                    id_TaiSan=id_tai_san,
                    id_NhanVien=payload.id_nhan_vien,
                )
                self.giao_nhan_repo.save(giao_nhan, commit=False)
                created.append(giao_nhan)
            self.session.commit()
            for item in created:
                self.session.refresh(item)
        except Exception:
            self.session.rollback()
            raise
        logger.info(
            "audit_asset_assign actor=%s receiver=%s count=%s",
            current_user.id_TaiKhoan,
            payload.id_nhan_vien,
            len(created),
        )
        return [self._to_cap_phat_response(item) for item in created]

    def lich_su_luan_chuyen(
        self,
        id_tai_san: str,
        current_user: TaiKhoan,
    ) -> list[LichSuLuanChuyenItem]:
        """UC27: return movement history for one asset, newest assignment first."""
        if self.tai_san_repo.get(id_tai_san) is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài sản")
        rows = self.giao_nhan_repo.list_by_tai_san(id_tai_san)
        self._assert_can_view_asset_history(current_user, rows)
        return [self._to_history_item(item) for item in rows]

    def thu_hoi(
        self,
        id_tai_san: str,
        payload: ThuHoiRequest,
        current_user: TaiKhoan,
    ) -> ThuHoiResponse:
        """UC28: close the current assignment and return the asset to stock."""
        self._assert_can_manage_assets(current_user)
        try:
            tai_san = self.tai_san_repo.get(id_tai_san, for_update=True)
            if tai_san is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy tài sản")
            current = self.giao_nhan_repo.get_current_by_tai_san(id_tai_san, for_update=True)
            if current is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Không tìm thấy bản ghi tài sản đang được mượn")
            self._assert_can_view_asset_history(current_user, [current])
            if tai_san.giaTri is not None and tai_san.giaTri >= HIGH_VALUE_ASSET_THRESHOLD:
                if not payload.tep_bien_ban:
                    raise HTTPException(
                        status.HTTP_400_BAD_REQUEST,
                        "Tài sản giá trị cao bắt buộc có biên bản bàn giao",
                    )

            current.ngayThuHoi = payload.ngay_thu_hoi
            current.tinhTrangThuHoi = payload.tinh_trang_thu_hoi
            current.tepBienBan = payload.tep_bien_ban
            current.trangThai = 0
            tai_san.trangThai = 1
            self.giao_nhan_repo.save(current, commit=False)
            self.tai_san_repo.save(tai_san, commit=False)
            self.session.commit()
            self.session.refresh(current)
        except Exception:
            self.session.rollback()
            raise
        logger.info(
            "audit_asset_recall actor=%s id_TaiSan=%s tinhTrangThuHoi=%s",
            current_user.id_TaiKhoan,
            id_tai_san,
            payload.tinh_trang_thu_hoi,
        )
        # BR28-2: hỏng hóc/mất được đánh dấu can_luu_y để frontend tô màu/cảnh báo.
        can_luu_y = payload.tinh_trang_thu_hoi.lower() in {"hỏng hóc", "hong hoc", "mất", "mat"}
        return ThuHoiResponse(
            id_GiaoNhan=current.id_GiaoNhan,
            id_TaiSan=current.id_TaiSan,
            ngayThuHoi=current.ngayThuHoi,
            tinh_trang_thu_hoi=current.tinhTrangThuHoi or payload.tinh_trang_thu_hoi,
            tepBienBan=current.tepBienBan,
            can_luu_y=can_luu_y,
        )

    def _assert_can_manage_assets(self, current_user: TaiKhoan) -> None:
        if current_user.id_VaiTro not in (ADMIN_ROLE_IDS | HCNS_ROLE_IDS | MANAGER_ROLE_IDS):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bạn không có quyền quản lý tài sản")

    def _assert_can_view_asset_history(
        self,
        current_user: TaiKhoan,
        history_rows: list[GiaoNhanTaiSan],
    ) -> None:
        if current_user.id_VaiTro in (ADMIN_ROLE_IDS | HCNS_ROLE_IDS):
            return
        if current_user.id_VaiTro in MANAGER_ROLE_IDS:
            # BR30-2: quản lý bị giới hạn phạm vi; hiện chưa có bảng scope nên chỉ cho xem tài sản liên quan trực tiếp.
            if any(row.id_NhanVien == current_user.id_TaiKhoan for row in history_rows):
                return
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Bạn không có quyền xem lịch sử tài sản ngoài phạm vi phụ trách",
        )

    def _to_cap_phat_response(self, item: GiaoNhanTaiSan) -> CapPhatItemResponse:
        return CapPhatItemResponse(
            id_GiaoNhan=item.id_GiaoNhan,
            id_TaiSan=item.id_TaiSan,
            id_NhanVien=item.id_NhanVien,
            ngayCapPhat=item.ngayCapPhat,
            tinhTrangBanGiao=item.tinhTrangBanGiao,
            trangThai=item.trangThai,
        )

    def _to_history_item(self, item: GiaoNhanTaiSan) -> LichSuLuanChuyenItem:
        # BR30-1: ngayThuHoi NULL nghĩa là dòng hiện hành, tài sản đang được người đó nắm giữ.
        return LichSuLuanChuyenItem(
            id_GiaoNhan=item.id_GiaoNhan,
            id_TaiSan=item.id_TaiSan,
            id_NhanVien=item.id_NhanVien,
            ngayCapPhat=item.ngayCapPhat,
            tinhTrangBanGiao=item.tinhTrangBanGiao,
            ngayThuHoi=item.ngayThuHoi,
            trangThai=item.trangThai,
            dang_su_dung=item.ngayThuHoi is None,
            tinhTrangThuHoi=item.tinhTrangThuHoi,
            tepBienBan=item.tepBienBan,
        )
