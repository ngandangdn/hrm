from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LoaiBaoCao(str, Enum):
    HANH_CHINH = "hanh-chinh"
    HIEU_SUAT = "hieu-suat"
    TONG_HOP = "tong-hop"
    QUAN_TRI = "quan-tri"


class DinhDangBaoCao(str, Enum):
    EXCEL = "excel"
    PDF = "pdf"


class BaoCaoFilter(BaseModel):
    tu_ngay: date
    den_ngay: date
    phong_ban: str | None = None
    du_an: str | None = None


class XuatBaoCaoRequest(BaoCaoFilter):
    dinh_dang: DinhDangBaoCao


class BaoCaoResponse(BaseModel):
    loai: LoaiBaoCao
    bo_loc: BaoCaoFilter
    bieu_do: list[dict[str, Any]] = Field(default_factory=list)
    bang_bieu: list[dict[str, Any]] = Field(default_factory=list)
    co_du_lieu: bool
