#!/usr/bin/env python3
"""Local development server for the Level 2.22 browser explorer.

Uses explicit MIME types because some Windows/Python installations inherit an
incorrect .js association from the Windows Registry and serve module files as
text/plain. Browsers reject JavaScript modules served with that MIME type.
"""
from __future__ import annotations

import contextlib
import os
import socket
import sys
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PREFERRED_PORT = 8000


class ExplorerRequestHandler(SimpleHTTPRequestHandler):
    # Force browser-safe MIME types rather than relying on the local Windows
    # Registry. The defaults vary across Python/Windows setups.
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".glb": "model/gltf-binary",
        ".gltf": "model/gltf+json",
        ".wasm": "application/wasm",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".mp3": "audio/mpeg",
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
    }

    def end_headers(self) -> None:
        # Keep local development predictable when the user refreshes files.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def choose_port(start: int = PREFERRED_PORT, attempts: int = 20) -> int:
    for port in range(start, start + attempts):
        with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"No free port found in the range {start}-{start + attempts - 1}.")


def open_browser(url: str) -> None:
    time.sleep(0.65)
    webbrowser.open(url, new=2)


def main() -> int:
    project_dir = Path(__file__).resolve().parent
    os.chdir(project_dir)

    try:
        port = choose_port()
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        input("Press Enter to close...")
        return 1

    url = f"http://{HOST}:{port}/"
    server = ThreadingHTTPServer((HOST, port), ExplorerRequestHandler)

    print("Starting the Level 2.22 local web server...")
    print(f"Serving files from: {project_dir}")
    print(f"Opening: {url}")
    print("Keep this window open while testing the site.")
    print("Press Ctrl+C to stop the server.")
    print()

    threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping the local web server...")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
