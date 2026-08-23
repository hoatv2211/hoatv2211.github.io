#!/usr/bin/env python
"""Reliable zero-dependency local server for portfolio testing."""

from __future__ import annotations

import argparse
import contextlib
import http.server
import socket
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8081


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    """Serve the repository with test-friendly headers and MIME types."""

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".css": "text/css",
        ".js": "text/javascript",
        ".json": "application/json",
        ".wasm": "application/wasm",
        ".webmanifest": "application/manifest+json",
        ".webp": "image/webp",
        ".data": "application/octet-stream",
        ".unityweb": "application/octet-stream",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        # Always show current working-tree files during local testing.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()


class ThreadingHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def port_is_available(host: str, port: int) -> bool:
    """Check bindability instead of assuming any listener is our server."""
    family = socket.AF_INET6 if ":" in host else socket.AF_INET
    with socket.socket(family, socket.SOCK_STREAM) as sock:
        with contextlib.suppress(OSError):
            sock.bind((host, port))
            return True
    return False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the portfolio locally for testing.")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Bind host (default: {DEFAULT_HOST})")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Bind port (default: {DEFAULT_PORT})")
    parser.add_argument("--no-browser", action="store_true", help="Do not open the default browser")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 1 <= args.port <= 65535:
        print("Error: --port must be between 1 and 65535.", file=sys.stderr)
        return 2

    if not port_is_available(args.host, args.port):
        print(
            f"Error: {args.host}:{args.port} is already in use. "
            "Stop that process or choose another port with --port.",
            file=sys.stderr,
        )
        return 1

    display_host = "localhost" if args.host in {"127.0.0.1", "0.0.0.0", "::"} else args.host
    url = f"http://{display_host}:{args.port}/"

    try:
        with ThreadingHTTPServer((args.host, args.port), PortfolioHandler) as server:
            print(f"Serving: {ROOT}")
            print(f"Local URL: {url}")
            print("Press Ctrl+C to stop.")

            if not args.no_browser:
                threading.Timer(0.35, webbrowser.open, args=(url,)).start()

            try:
                server.serve_forever(poll_interval=0.25)
            except KeyboardInterrupt:
                print("\nStopping local server...")
    except OSError as exc:
        print(f"Error: could not start server: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
