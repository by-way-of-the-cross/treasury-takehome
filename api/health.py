"""
Health / version endpoint — Python (Vercel Function).

A liveness probe that also reports which vision model the deployment is
configured to route through the Vercel AI Gateway, and confirms the Python
runtime is live alongside the Next.js app. Standard library only.

GET /api/health -> {"status": "ok", "model": "...", "runtime": "python", ...}
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import platform
import sys


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        body = {
            "status": "ok",
            "runtime": "python",
            "pythonVersion": platform.python_version(),
            "model": os.environ.get("GATEWAY_MODEL", "google/gemini-2.5-flash"),
            "node": sys.platform,
        }
        payload = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
