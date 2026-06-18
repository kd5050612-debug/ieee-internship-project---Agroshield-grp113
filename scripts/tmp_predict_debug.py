from __future__ import annotations

import os
import json
import mimetypes
import urllib.request
import urllib.parse
from pathlib import Path
import sys

BACKEND = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000")
PREDICT_URL = BACKEND.rstrip("/") + "/predict"

# Simple multipart/form-data upload without external deps (no requests).

def _encode_multipart(fields: dict[str, str], files: list[tuple[str, str, bytes, str]]) -> tuple[str, bytes]:
    boundary = "----bbaiBoundary" + os.urandom(8).hex()
    body = bytearray()

    for name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(
            f"Content-Disposition: form-data; name=\"{name}\"\r\n\r\n".encode()
        )
        body.extend(value.encode())
        body.extend(b"\r\n")

    for field_name, filename, file_bytes, content_type in files:
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(
            f"Content-Disposition: form-data; name=\"{field_name}\"; filename=\"{filename}\"\r\n".encode()
        )
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode())
        body.extend(file_bytes)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode())
    content_type_header = f"multipart/form-data; boundary={boundary}"
    return content_type_header, bytes(body)


def predict(image_path: str) -> dict:
    p = Path(image_path)
    if not p.exists():
        raise FileNotFoundError(str(p))

    mime, _ = mimetypes.guess_type(str(p))
    mime = mime or "application/octet-stream"

    img_bytes = p.read_bytes()
    content_type_header, body = _encode_multipart(
        fields={},
        files=[("image", p.name, img_bytes, mime)],
    )

    req = urllib.request.Request(
        PREDICT_URL,
        data=body,
        method="POST",
        headers={"Content-Type": content_type_header},
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Provide image path")
        sys.exit(1)

    result = predict(sys.argv[1])
    print(json.dumps(result, indent=2))

