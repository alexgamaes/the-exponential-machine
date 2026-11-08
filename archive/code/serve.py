#!/usr/bin/env python3
import http.server, socketserver, webbrowser, os

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))
webbrowser.open(f'http://localhost:{PORT}')
with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f'Serving at http://localhost:{PORT} — Ctrl+C to stop')
    httpd.serve_forever()
