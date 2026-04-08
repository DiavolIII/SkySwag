from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db, Product
from routes import register_routes
from ai_assistant import register_ai_routes
from logging_config import logger
import os
import json

# создаем приложение Flask
app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.config.from_object(Config)

CORS(app, origins=['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:8000'])

# инициализация бд
db.init_app(app)

# инициализация миграций
migrate = Migrate(app, db)

# регистрация маршрутов
register_routes(app)

# регистрация аи маршрутов
register_ai_routes(app)


def load_products_from_json():
    """загружает продукты из json, если таблица пуста"""
    if Product.query.count() == 0:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'products.json')
        
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                for p in data.get('products', []):
                    product = Product(
                        name=p.get('name', 'Unknown'),
                        model=p.get('model', ''),
                        version=p.get('version', ''),
                        price=p.get('price', 0),
                        year=p.get('year', 2025),
                        description=p.get('description', ''),
                        image=p.get('image', ''),
                        model_file=p.get('model_file', 'helicopter.glb'),
                        in_stock=p.get('inStock', True)
                    )
                    db.session.add(product)
                
                db.session.commit()
                logger.info(f"Loaded {len(data.get('products', []))} products from products.json")
                
            except Exception as e:
                logger.error(f"Error loading products from JSON: {e}")
        else:
            logger.warning(f"products.json not found at {json_path}")
    else:
        logger.info(f"Database already has {Product.query.count()} products")


@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path='index.html'):
    """отдает HTML, CSS, JS файлы из папки frontend"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.path}")
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {error}")
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    with app.app_context():
        # создаем все таблицы, если их нет
        db.create_all()
        logger.info("Database tables created/verified")
        
        # загружаем продукты из JSON
        load_products_from_json()
    
    print("\n" + "=" * 60)
    print("SKYSWAG SERVER RUNNING")
    print("=" * 60)
    print("📍 Главная страница:      http://localhost:5000")
    print("📍 Каталог:               http://localhost:5000/catalog.html")
    print("📍 Профиль:               http://localhost:5000/profile.html")
    print("📍 Админ-панель:          http://localhost:5000/admin-panel.html")
    print("📍 3D Конфигуратор:       http://localhost:5000/configurator.html")
    print("📍 AI Помощник:           нажмите на иконку в правом нижнем углу")
    print("=" * 60)
    print("Мастер-пароль админ-панели: SkySwagAdmin2024!@#$")
    print("Система аналитики активна")
    print("аи ассистент на DeepSeek API - (требуется пополнение токенов) ")
    print("=" * 60)
    print("\nНажмите Ctrl+C для остановки сервера\n")
    
    # Запуск сервера
    app.run(debug=True, host='0.0.0.0', port=5000)