from pydantic import BaseModel, Field


class GanVaiTroRequest(BaseModel):
    id_VaiTro_list: list[str] = Field(min_length=1)
