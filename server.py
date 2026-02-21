import http.server
import socketserver
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

os.chdir('frontend')

print("=" * 50)
print("SKYSWAG 3D SERVER")
print("=" * 50)
print(f"Порт: {PORT}")
print(f"Папка: {os.getcwd()}")
print(f"Модели: {len([f for f in os.listdir('assets/models') if f.endswith('.glb')])} шт.")
print("=" * 50)
print("Откройте: http://localhost:8000/catalog.html")
print("=" * 50)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен")