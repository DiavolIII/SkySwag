from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import time
import os

SKYSWAG_LOGO = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     ███████╗██╗  ██╗██╗   ██╗███████╗██╗    ██╗ █████╗  ██████╗              ║
║     ██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔════╝██║    ██║██╔══██╗██╔════╝              ║
║     ███████╗█████╔╝  ╚████╔╝ ███████╗██║ █╗ ██║███████║██║  ███╗             ║
║     ╚════██║██╔═██╗   ╚██╔╝  ╚════██║██║███╗██║██╔══██║██║   ██║             ║
║     ███████║██║  ██╗   ██║   ███████║╚███╔███╔╝██║  ██║╚██████╔╝             ║
║     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝              ║
║                                                                              ║
║              ███████╗██╗██╗   ██╗███████╗██████╗                             ║
║              ██╔════╝██║╚██╗ ██╔╝██╔════╝██╔══██╗                            ║
║              ███████╗██║ ╚████╔╝ █████╗  ██║  ██║                            ║
║              ╚════██║██║  ╚██╔╝  ██╔══╝  ██║  ██║                            ║
║              ███████║██║   ██║   ███████╗██████╔╝                            ║
║              ╚══════╝╚═╝   ╚═╝   ╚══════╝╚═════╝                             ║
║                                                                              ║
║                    ███████╗██╗   ██╗███████╗████████╗                        ║
║                    ██╔════╝██║   ██║██╔════╝╚══██╔══╝                        ║
║                    ███████╗██║   ██║█████╗     ██║                           ║
║                    ╚════██║██║   ██║██╔══╝     ██║                           ║
║                    ███████║╚██████╔╝███████╗   ██║                           ║
║                    ╚══════╝ ╚═════╝ ╚══════╝   ╚═╝                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

products = [
    {"id": "h130-basic", "name": "Airbus H130", "version": "Basic", "price": 6100000, "year": 2025, "model": "H130"},
    {"id": "h130-middle", "name": "Airbus H130", "version": "Middle", "price": 6230000, "year": 2025, "model": "H130"},
    {"id": "h125", "name": "Airbus H125", "version": "Standard", "price": 4550000, "year": 2024, "model": "H125"},
    {"id": "r66", "name": "Robinson R66", "version": "Turbine", "price": 1600000, "year": 2025, "model": "R66"}
]

class CORSHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == '/products':
            params = urllib.parse.parse_qs(parsed.query)
            
            # Фильтрация по поиску
            filtered = products.copy()
            if 'q' in params:
                q = params['q'][0].lower()
                filtered = [p for p in filtered if q in p['name'].lower()]
                print(f"🔍 Поиск: '{q}' найдено {len(filtered)} товаров")
            
            # Пагинация
            page = int(params.get('page', [1])[0])
            page_size = int(params.get('page_size', [4])[0])
            start = (page - 1) * page_size
            end = start + page_size
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                "data": filtered[start:end],
                "count": len(filtered),
                "page": page,
                "page_size": page_size,
                "total_pages": (len(filtered) + page_size - 1) // page_size
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
            print(f"\n📦 [{time.strftime('%H:%M:%S')}] GET /products")
            print(f"   ├─ Страница: {page}/{response['total_pages']}")
            print(f"   ├─ Товаров на странице: {len(filtered[start:end])}")
            print(f"   └─ Всего товаров: {len(filtered)}")
            
        else:
            self.send_response(404)
            self.end_headers()
            print(f"❌ [{time.strftime('%H:%M:%S')}] 404 Not Found: {parsed.path}")
    
    def do_POST(self):
        if self.path == '/estimate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"\n📝 [{time.strftime('%H:%M:%S')}] НОВАЯ ЗАЯВКА НА ОЦЕНКУ")
            print(f"   ├─ Имя: {data.get('name', 'Не указано')}")
            print(f"   ├─ Телефон: {data.get('phone', 'Не указано')}")
            print(f"   ├─ Модель: {data.get('model', 'Не указано')}")
            print(f"   └─ Год/Часы: {data.get('year', '?')} / {data.get('hours', '?')}")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Заявка отправлена"}).encode('utf-8'))
        
        elif self.path == '/order':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"\n💰 [{time.strftime('%H:%M:%S')}] НОВЫЙ ЗАКАЗ")
            print(f"   ├─ Имя: {data.get('name', 'Не указано')}")
            print(f"   ├─ Телефон: {data.get('phone', 'Не указано')}")
            print(f"   ├─ Модель: {data.get('model', 'Не указано')}")
            print(f"   ├─ Цвет: {data.get('color', 'Не указано')}")
            print(f"   └─ Сумма: {data.get('totalPrice', '?')} €")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Заказ оформлен"}).encode('utf-8'))
        
        else:
            self.send_response(404)
            self.end_headers()
            print(f"❌ [{time.strftime('%H:%M:%S')}] 404 Not Found POST: {self.path}")

def print_big_header():
    """Огромный заголовок на всю консоль"""
    os.system('cls' if os.name == 'nt' else 'clear')  # Очистка консоли
    print("\033[95m")  # Фиолетовый цвет (если терминал поддерживает)
    print(SKYSWAG_LOGO)
    print("\033[0m")  # Сброс цвета
    
    # Информационная панель
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 78 + "║")
    print("║" + " " * 25 + "🚁 СТАТУС СЕРВЕРА 🚁" + " " * 26 + "║")
    print("║" + " " * 78 + "║")
    print("╠" + "═" * 78 + "╣")
    print(f"║  📍 АДРЕС:          http://localhost:3001                ║")
    print(f"║  📡 ENDPOINT:       http://localhost:3001/products       ║")
    print(f"║  📦 ТОВАРОВ:        {len(products)} шт.                             ║")
    print(f"║  🕒 ВРЕМЯ:          {time.strftime('%Y-%m-%d %H:%M:%S')}              ║")
    print("╠" + "═" * 78 + "╣")
    print("║  🚀 КОМАНДЫ:                                              ║")
    print("║  • Ctrl+C - остановка сервера                             ║")
    print("║  • Откройте сайт: frontend/index.html                     ║")
    print("╚" + "═" * 78 + "╝")
    print()

def print_footer():
    """Красивый футер при остановке"""
    print("\n" + "╔" + "═" * 78 + "╗")
    print("║" + " " * 78 + "║")
    print("║" + " " * 30 + "👋 ДО СВИДАНИЯ! 👋" + " " * 29 + "║")
    print("║" + " " * 78 + "║")
    print("╚" + "═" * 78 + "╝")
    print("\nСпасибо что используете SkySwag! ❤️\n")

if __name__ == '__main__':
    print_big_header()
    
    server = HTTPServer(('localhost', 3001), CORSHandler)
    print("📡 Сервер запущен и ожидает подключений...")
    print("═" * 80)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print_footer()
        server.server_close()