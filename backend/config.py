import os
import secrets

class Config:
    # простой путь к БД в корне backend
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, 'skywag.db')
    
    # секретные ключи
    SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
    
    # путь к базе данных
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DB_PATH}'
    
    # отключаем отслеживание
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # jwt секрет
    JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
    
    # лог файл
    LOG_FILE = os.path.join(BASE_DIR, 'instance', 'app.log')
    
    # супер-админ пароль
    SUPER_ADMIN_PASSWORD = os.environ.get('SUPER_ADMIN_PASSWORD', 'SkySwag675810')
    
    # кэширование (отключаем для простоты)
    CACHE_ENABLED = False
    CACHE_TTL = 300
    
    # пагинация
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # логирование
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'