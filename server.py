# -*- coding: utf-8 -*-

import http.server
import socketserver
import sys

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"服务器运行在 http://localhost:{PORT}")
        print("按 Ctrl+C 可以停止服务器...")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n正在关闭服务器...")
    sys.exit(0) 