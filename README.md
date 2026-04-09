<div align="center">
  
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&duration=3000&pause=1000&color=D4AF37&center=true&vCenter=true&random=false&width=600&height=80&lines=SKYSWAG;ПРЕМИАЛЬНЫЕ+ВЕРТОЛЕТЫ;" alt="Typing SVG" />
  
  <p>
    <img src="https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/Flask-2.3.3-000000?style=for-the-badge&logo=flask&logoColor=white" />
    <img src="https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js&logoColor=white" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
    <img src="https://img.shields.io/badge/HTML5-CSS3-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
    <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
    <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
    <img src="https://img.shields.io/badge/Unittest-100%25-2E8B57?style=for-the-badge&logo=pytest&logoColor=white" />
  </p>

  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" width="100%">
</div>

# 🚁 SkySwag - Премиальная продажа вертолетов с 3D визуализацией

<div align="center">
  
  *"Где технологии встречаются с роскошью"*
  
</div>


## ✨ О проекте

**SkySwag** - это полнофункциональная веб-платформа для демонстрации, конфигурации и продажи вертолетов премиум-класса. Проект объединяет интерактивный 3D-конфигуратор на базе Three.js, систему аутентификации с JWT-токенами, бонусную программу с градацией статусов (Standard → Premium → VIP), AI-ассистента с локальной базой знаний, административную панель для управления всеми сущностями системы, а также встроенную аналитику для отслеживания поведения пользователей.

Ключевая особенность — возможность в реальном времени изменять цвет и опции вертолета в 3D-сцене с мгновенным пересчетом стоимости. Проект разработан в рамках курсовой работы и демонстрирует интеграцию передовых веб-технологий для создания уникального пользовательского опыта.

## 🛠 Технологический стек

| Категория | Технологии | Версия |
|-----------|------------|--------|
| **Backend** | Python, Flask, SQLAlchemy, Flask-Migrate | 3.12+, 2.3.3 |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | - |
| **3D Графика** | Three.js, GLTF/GLB Loader, OrbitControls | r128 |
| **База данных** | SQLite (Alembic миграции) | 3.45+ |
| **Аутентификация** | JWT, bcrypt | - |
| **Тестирование** | unittest, pytest | - |
| **Автоматизация** | bat-скрипты (setup.bat, skywag-manager.bat) | - |
| **Контроль версий** | Git, GitHub | - |

## 🏗 Архитектура проекта

| Уровень | Компоненты | Технологии |
|:-------:|------------|-------------|
| **КЛИЕНТ (Браузер)** |
| └── Страницы | `index.html` (главная) · `catalog.html` (каталог) · `configurator.html` (3D) · `admin-panel.html` (админка) · `profile.html` (личный кабинет) · `services.html` · `news.html` · `leasing.html` · `about.html` · `models.html` · `view-model.html` | HTML5 · CSS3 · Адаптивная верстка |
| └── Frontend JS | `auth.js` · `catalog.js` · `analytics.js` · `ai-assistant.js` · `main.js` · `configurator.js` · `leasing.js` · `news.js` · `model-loader.js` · `three-setup.js` · `api.js` | Vanilla JS (ES6+) · LocalStorage · SessionStorage |
| └── 3D Сцена | GLTF/GLB модели (5 шт) · Орбит контроль · Динамическая смена цвета · Подсветка и тени | Three.js (r128) · GLTFLoader · WebGL |
| | | |
| **ТРАНСПОРТ** |
| └── Протокол | HTTP/HTTPS · Fetch API · JWT Token в заголовке `Authorization: Bearer <token>` | REST API · JSON |
| | | |
| **СЕРВЕР (Backend)** |
| └── Точка входа | `app.py` — регистрация Blueprint, настройка CORS, раздача статики, обработка ошибок 404/500 | Flask 2.3.3 · Flask-CORS |
| └── Маршрутизация | `routes.py` — 40+ API эндпоинтов (каталог, заказы, админка, трекинг, аналитика) | Flask Blueprint · декораторы |
| └── Аутентификация | `auth.py` — JWT генерация/декодирование · bcrypt хэширование паролей · декоратор `@token_required` | PyJWT · bcrypt |
| └── Администрирование | `admin_auth.py` — декоратор `@super_admin_required` · супер-админ сессии | Flask session |
| └── Модели БД | `models.py` — 8 таблиц: User, Product, Order, Estimate, PageView, UserAction | SQLAlchemy ORM |
| └── AI Ассистент | `ai_assistant.py` — локальная база знаний (30+ ключевых слов) · история диалогов в памяти · fallback на менеджера | JSON · in-memory storage |
| └── Кэширование | `cache.py` — декоратор `@cached` · генерация ключей через MD5 · TTL 5-10 минут · инвалидация при изменении | In-memory SimpleCache |
| └── Логирование | `logging_config.py` — вывод в консоль и файлы (`app.log`, `db_operations.log`, `project_operations.log`) | Python logging |
| └── Конфигурация | `config.py` — секретные ключи, пути к БД, JWT secret, супер-админ пароль, параметры кэша и пагинации | Environment variables · secrets |
| | | |
| **БАЗА ДАННЫХ** |
| └── SQLite | `skywag.db` — файловая БД, миграции через Alembic (Flask-Migrate) | SQLite 3.45+ · Alembic |
| └── Таблицы | `users` · `products` · `orders` · `estimates` · `page_views` · `user_actions` | SQLAlchemy models |
| | | |
| **АВТОМАТИЗАЦИЯ** |
| └── Скрипты | `skywag-manager.bat` — создание venv, установка зависимостей, инициализация БД, запуск сервера · `setup.bat` — первичная настройка | Batch (Windows) |
| └── Тестирование | `tests/test_api.py` — модульные тесты API (unittest) | unittest · pytest |


## 🏗 Архитектура (схема взаимодействия)

**Уровень 1: Клиент (Браузер)**

| Тип | Компоненты |
| --- | --- |
| HTML | index.html · catalog.html · configurator.html · admin-panel.html · profile.html · services.html · news.html · leasing.html · about.html · models.html · view-model.html |
| JS | auth.js · catalog.js · analytics.js · ai-assistant.js · main.js · configurator.js · leasing.js · news.js · model-loader.js · three-setup.js · api.js |
| 3D | GLTF/GLB модели · OrbitControls · смена цвета · тени |

**Уровень 2: Транспорт**

| Протокол | Auth | Формат |
| --- | --- | --- |
| HTTP + Fetch API | JWT Bearer token | JSON |

**Уровень 3: Backend (Flask)**

| Файл | Функция |
| --- | --- |
| app.py | точка входа · CORS · Blueprint · статика |
| routes.py | 40+ API (каталог, заказы, админка, трекинг) |
| auth.py | JWT + bcrypt · декоратор token_required |
| admin_auth.py | декоратор super_admin_required |
| models.py | 8 таблиц SQLAlchemy |
| ai_assistant.py | база знаний 30+ ключей · диалоги в памяти |
| cache.py | in-memory кэш · TTL · MD5 ключи |
| logging_config.py | файловые логи (app.log, db_operations.log) |
| config.py | секреты · пути · JWT secret · пароль админа |

**Уровень 4: База данных**

| Тип | Таблицы | Миграции |
| --- | --- | --- |
| SQLite | users · products · orders · estimates · page_views · user_actions | Alembic |

**Уровень 5: Автоматизация**

| Скрипт | Назначение |
| --- | --- |
| skywag-manager.bat | venv · зависимости · БД · запуск |
| setup.bat | первичная настройка |
| tests/test_api.py | unittest |

**Схема потока данных**
```bash
[Браузер] ──HTTP + JWT──▶ [app.py] ──┬──▶ [routes.py] ──▶ [models.py] ──▶ [SQLite]
│
├──▶ [auth.py]
│
├──▶ [admin_auth.py]
│
├──▶ [cache.py] ◀──┘
│
├──▶ [ai_assistant.py]
│
└──▶ [logging_config.py] ──▶ *.log
```
### Взаимодействие компонентов

| Этап | Описание |
|------|----------|
| 1. Загрузка страницы | Браузер запрашивает HTML/CSS/JS файлы у Flask (статическая раздача из папки frontend) |
| 2. Инициализация | JavaScript инициализирует 3D сцену (Three.js), проверяет JWT токен в localStorage |
| 3. API запросы | При загрузке каталога отправляется GET /api/products с параметрами фильтрации |
| 4. Кэширование | Flask проверяет наличие закэшированного ответа (декоратор @cached, TTL 5-10 минут) |
| 5. Аутентификация | При запросе /api/orders срабатывает декоратор @token_required, декодируется JWT |
| 6. БД | SQLAlchemy выполняет запрос к SQLite, результат сериализуется в JSON |
| 7. Ответ | Данные возвращаются на клиент, JavaScript обновляет DOM (карточки товаров) |
| 8. 3D конфигуратор | При загрузке модели через GLTFLoader, Three.js отображает вертолет с возможностью вращения |

### Особенности архитектуры

- **Blueprint-модульность**: Все эндпоинты разделены на api_bp и ai_bp, зарегистрированы в app.py
- **Декораторы**: token_required, cached, super_admin_required для сквозной функциональности
- **In-memory кэш**: SimpleCache с генерацией ключей через MD5 от параметров запроса
- **Трекинг**: Отдельные эндпоинты для фиксации page_views и user_actions (асинхронно)
- **Миграции**: Alembic управляет изменениями схемы SQLite (версионирование БД)

## 📦 Установка и запуск

### Предварительные требования

| Требование | Версия | Ссылка |
|------------|--------|--------|
| Python | 3.12+ | [python.org](https://python.org) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Браузер | Современный | Chrome/Firefox/Edge |

### Быстрый старт (рекомендуемый способ)

```bash
# Клонирование репозитория
git clone https://github.com/DiavolIII/SkySwag.git
cd SkySwag

# Запуск через bat-скрипт (автоматически создает venv, устанавливает зависимости, инициализирует БД)
skywag-manager.bat

# Открыть в браузере
http://localhost:5000
```

### Альтернативный ручной запуск
```bash
# Создание виртуального окружения
cd backend
python -m venv venv
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python app.py

# Открыть в браузере
http://localhost:5000
```

### Запуск тестов
```bash
cd backend
python -m unittest tests/test_api.py -v
```

### Мастер-пароль для доступа к админ-панели
```bash
# SkySwagAdmin2024!@#$ (для прода - унесу в кэш или облако)
```
