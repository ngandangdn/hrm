import os
import sys
from pathlib import Path

import uvicorn


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DB_URL", "sqlite:///./demo_hicas.db")
os.environ.setdefault("ENVIRONMENT", "seed")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
