import os
import sys
from pathlib import Path

import uvicorn


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
DATABASE_PATH = PROJECT_ROOT / "Database" / "demo_hicas.db"
sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DB_URL", f"sqlite:///{DATABASE_PATH.as_posix()}")
os.environ.setdefault("ENVIRONMENT", "seed")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
