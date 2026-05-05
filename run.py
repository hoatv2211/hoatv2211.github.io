import http.server
import socket
import socketserver
import webbrowser
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).resolve().parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Disable all caching so every reload fetches fresh files
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


def main() -> None:
    url = f"http://localhost:{PORT}/index.html"
    if is_port_in_use(PORT):
        print(f"Port {PORT} is already open. Opening browser...")
        webbrowser.open(url)
        return
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {ROOT} at {url}")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()


if __name__ == "__main__":
    main()
