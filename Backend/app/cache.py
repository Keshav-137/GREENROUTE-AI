from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path
from typing import Any


class RequestCache:
    """Small SQLite disk cache for every external request and derived demo result."""

    def __init__(self, path: str | Path = "data/cache/requests.sqlite3") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.path) as db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS responses "
                "(request_hash TEXT PRIMARY KEY, payload TEXT NOT NULL)"
            )

    @staticmethod
    def key(namespace: str, request: Any) -> str:
        encoded = json.dumps(request, sort_keys=True, default=str).encode()
        return hashlib.sha256(namespace.encode() + b":" + encoded).hexdigest()

    def get(self, key: str) -> Any | None:
        with sqlite3.connect(self.path) as db:
            row = db.execute(
                "SELECT payload FROM responses WHERE request_hash = ?", (key,)
            ).fetchone()
        return json.loads(row[0]) if row else None

    def set(self, key: str, payload: Any) -> None:
        with sqlite3.connect(self.path) as db:
            db.execute(
                "INSERT OR REPLACE INTO responses(request_hash, payload) VALUES (?, ?)",
                (key, json.dumps(payload)),
            )


cache = RequestCache()
