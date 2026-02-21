from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import os

# Тестовые данные
PRODUCTS = [
    {"id": "1", "name": "Airbus H130", "model": "H130", "price": 6100000, "year": 2025},
    {"id": "2", "name": "Airbus H125", "model": "H125", "price": 4550000, "year": 2024},
    {"id": "3", "name": "Robinson R66", "model": "R66", "price": 1600000, "year": 2025}
]

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == '/products':
            self.handle_products()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Not found"}')
    
    def handle_products(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "data": PRODUCTS,
            "count": len(PRODUCTS),
            "page": 1,
            "page_size": 10,
            "total_pages": 1
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))
        print(f"✅ Отправлено {len(PRODUCTS)} товаров")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    print("\n" + "="*50)
    print("🚁 SKYSWAG SERVER")
    print("="*50)
    print(f"Порт: {port}")
    print(f"Товаров: {len(PRODUCTS)}")
    print("="*50)
    print("URL: http://localhost:8000/products")
    print("="*50)
    print("Нажмите Ctrl+C для остановки\n")
    
    server = HTTPServer(('localhost', port), RequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Сервер остановлен")

if __name__ == '__main__':
    run_server()