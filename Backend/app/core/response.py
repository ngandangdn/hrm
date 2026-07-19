from typing import Any


def api_response(data: Any = None, message: str = "Thành công") -> dict[str, Any]:
    return {"status": "success", "data": data, "message": message}
