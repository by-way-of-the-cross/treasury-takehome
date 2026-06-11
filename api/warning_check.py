"""
Independent government-warning validator — Python (Vercel Function).

This is a deliberate second runtime. The README flags, as production
hardening, "a second independent extraction/validation pass (different
model/stack) for tamper-sensitive fields." The mandatory health warning is
the most tamper-sensitive field on the label, so its canonical-text check
lives here, in Python, separate from the TypeScript verifier. Same rule,
different stack — a cross-check that does not share the Node trust boundary.

Pure standard library: no requirements.txt needed.

POST /api/warning_check
  body: {"warning": "<transcribed government warning text>"}
  ->   {"isCanonical": bool, "headerAllCaps": bool, "normalized": str, ...}
"""

from http.server import BaseHTTPRequestHandler
import json
import re

# 27 CFR 16.21 — the mandatory statement, verbatim.
CANONICAL = (
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should "
    "not drink alcoholic beverages during pregnancy because of the risk of "
    "birth defects. (2) Consumption of alcoholic beverages impairs your "
    "ability to drive a car or operate machinery, and may cause health "
    "problems."
)

HEADER = "GOVERNMENT WARNING"


def unwrap(text: str) -> str:
    """Undo label line-wrapping: join hyphenated breaks, collapse whitespace."""
    # "PREG-\nNANCY" -> "PREGNANCY": a hyphen at a line break is wrapping, not
    # a real hyphen (real approved labels do this).
    text = re.sub(r"-\s*\n\s*", "", text)
    # Tolerate "GOVERNMENT WARNING :" (space before colon) seen on real labels.
    text = re.sub(r"\s+:", ":", text)
    return re.sub(r"\s+", " ", text).strip()


def check(raw: str) -> dict:
    normalized = unwrap(raw)
    # Header case is mandated (16.22a); body case is not — compare body
    # case-insensitively, header exactly.
    header_all_caps = bool(re.match(r"^\s*GOVERNMENT WARNING\b", raw))
    is_canonical = normalized.lower() == CANONICAL.lower()
    return {
        "isCanonical": is_canonical,
        "headerAllCaps": header_all_caps,
        "verdict": (
            "match" if is_canonical and header_all_caps
            else "needs_review" if is_canonical
            else "mismatch"
        ),
        "normalized": normalized,
        "canonical": CANONICAL,
        "runtime": "python",
    }


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: dict) -> None:
        payload = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b""
            data = json.loads(raw or b"{}")
            warning = data.get("warning")
            if not isinstance(warning, str) or not warning.strip():
                self._send(400, {"error": "Provide a non-empty 'warning' string."})
                return
            self._send(200, check(warning))
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid JSON body."})

    def do_GET(self) -> None:
        # Convenience: describe the contract.
        self._send(200, {
            "service": "government-warning validator",
            "runtime": "python",
            "method": "POST",
            "body": {"warning": "string"},
            "canonical": CANONICAL,
        })
