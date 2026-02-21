import http.server
import socketserver
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

os.chdir('frontend')  # Переходим в папку frontend

print(f"🚁 Сервер запущен на http://localhost:{PORT}")
print(f"📁 Откройте: http://localhost:{PORT}/catalog.html")
print("Нажмите Ctrl+C для остановки")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()