import json
import logging
import uuid
import re
from flask import request, jsonify, Blueprint
from auth import token_required

logger = logging.getLogger('skywag.ai')

KNOWLEDGE_BASE = {
    "вертолёт": "Мы предлагаем вертолеты Airbus H125, H130, H145, Robinson R66, Eurocopter EC145, Merlin MK2, Stealth Wolf. Все модели доступны в различных комплектациях.",
    "вертолеты": "Мы предлагаем вертолеты Airbus H125, H130, H145, Robinson R66, Eurocopter EC145, Merlin MK2, Stealth Wolf. Все модели доступны в различных комплектациях.",
    "h125": "Airbus H125 - многоцелевой вертолет. Цена от 4 550 000 €. Вместимость: 6 мест. Отличный выбор для бизнес-перевозок.",
    "h130": "Airbus H130 - вертолет VIP-класса. Цена от 6 100 000 €. Вместимость: 7 мест. Идеален для премиальных перевозок.",
    "h145": "Airbus H145 - премиальный вертолет. Цена от 8 900 000 €. Вместимость: 8 мест. Высокий уровень комфорта.",
    "r66": "Robinson R66 - турбинный вертолет. Цена от 1 600 000 €. Вместимость: 5 мест. Экономичный и надежный.",
    "ec145": "Eurocopter EC145 - многоцелевой вертолет. Цена от 7 500 000 €. Широкий спектр применения.",
    "merlin": "Merlin MK2 - военно-транспортный вертолет. Цена от 12 000 000 €. Высокая грузоподъемность.",
    "stealth": "Stealth Wolf - стелс-вертолет. Цена от 25 000 000 €. Технология малозаметности.",
    "цена": "Цены на вертолеты: Airbus H125 - от 4 550 000 €, H130 - от 6 100 000 €, H145 - от 8 900 000 €, Robinson R66 - от 1 600 000 €, EC145 - от 7 500 000 €, Merlin MK2 - от 12 000 000 €, Stealth Wolf - от 25 000 000 €.",
    "лизинг": "Мы предлагаем лизинг от 8% годовых. Первоначальный взнос от 15%. Срок до 7 лет. Работаем с ведущими банками: Сбер, ВТБ, Газпромбанк, Альфа-Банк.",
    "кредит": "Мы предлагаем лизинг от 8% годовых. Первоначальный взнос от 15%. Срок до 7 лет.",
    "доставка": "Доставляем вертолеты по всему миру. Авиадоставка 3-7 дней, морская 14-30 дней. Полное таможенное оформление.",
    "сервис": "У нас есть сертифицированный сервисный центр в Москве. Проводим ТО, капремонт, диагностику. Выездное обслуживание.",
    "обучение": "Проводим обучение пилотов. Курсы: Private, Commercial, Instrument. Тренажерная подготовка. Сертификация.",
    "страхование": "Страхуем вертолеты КАСКО, ответственность, экипаж. Работаем с ведущими страховыми компаниями.",
    "конфигуратор": "3D конфигуратор позволяет выбрать модель, цвет и опции. Доступен на сайте в разделе Конфигуратор.",
    "3d": "3D модели вертолетов доступны в каталоге. Нажмите кнопку '3D' на карточке товара для просмотра.",
    "контакт": "Наши контакты: email info@skywag.ru, телефон +7 (495) 123-45-67. Режим работы: ежедневно с 9:00 до 21:00.",
    "телефон": "Наш телефон: +7 (495) 123-45-67. Звоните с 9:00 до 21:00.",
    "email": "Наш email: info@skywag.ru. Отвечаем в течение 24 часов.",
    "адрес": "Наш сервисный центр находится в Москве, аэропорт Внуково-3.",
    "о компании": "SkySwag работает с 2015 года. Мы лидер рынка вертолетной индустрии. Более 500 проданных вертолетов.",
    "скидка": "Актуальные акции и скидки уточняйте у менеджеров по телефону +7 (495) 123-45-67.",
    "гарантия": "Предоставляем гарантию 1 год на все вертолеты. Возможно расширение гарантии до 5 лет."
}

conversations = {}


def get_conversation(session_id):
    """получить историю диалога"""
    if session_id not in conversations:
        conversations[session_id] = []
    return conversations[session_id]


def save_conversation(session_id, user_msg, assistant_msg):
    """сохранить диалог"""
    conv = get_conversation(session_id)
    conv.append({"role": "user", "content": user_msg})
    conv.append({"role": "assistant", "content": assistant_msg})
    if len(conv) > 20:
        conv[:2] = []


def find_answer(question):
    """поиск ответа в локальной базе знаний"""
    question_lower = question.lower()

    # поиск по ключевым словам
    for keyword, answer in KNOWLEDGE_BASE.items():
        if keyword in question_lower:
            return answer

    # проверка на запрещенные темы (для начала подразумевалась для Api клауда, но щас этот блок бесполезен - по факту для галочки) - принцип работы с рабочим апи: исключение сторонних тем. можно подрубить личный апи там стоит 70руб 1млн токенов
    forbidden_keywords = ['политика', 'война', 'религия', 'медицина', 'лекарство', 'здоровье', 'закон', 'юрист']
    for forbidden in forbidden_keywords:
        if forbidden in question_lower:
            return "Извините, я специализируюсь только на вопросах о вертолетах и услугах SkySwag. Чем могу помочь вам с выбором вертолета? 🚁"

    return None


def ask_ai(question, session_id):
    """ответ на вопрос (локальная версия без апи)"""
    conversation = get_conversation(session_id)

    answer = find_answer(question)

    if answer:
        save_conversation(session_id, question, answer)
        return answer

    # сли не нашли - то перенаправляем на НТ
    default_answer = "Я не нашел точного ответа на ваш вопрос. Пожалуйста, свяжитесь с нашим менеджером по телефону +7 (495) 123-45-67 или напишите на email info@skywag.ru для получения подробной консультации. 🚁"

    save_conversation(session_id, question, default_answer)
    return default_answer


# ========== FLASK ЭНДПОИНТЫ ДЛЯ АИ ==========
ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/chat', methods=['POST'])
def chat():
    """эндпоинт для общения с AI"""
    data = request.json
    question = data.get('message', '')
    session_id = data.get('session_id')

    if not session_id:
        session_id = str(uuid.uuid4())

    if not question:
        return jsonify({'error': 'Message is required'}), 400

    logger.info(f"AI question from session {session_id}: {question[:100]}...")

    answer = ask_ai(question, session_id)

    return jsonify({
        'answer': answer,
        'session_id': session_id
    })


@ai_bp.route('/chat/clear', methods=['POST'])
def clear_chat():
    """очистить историю диалога"""
    data = request.json
    session_id = data.get('session_id')

    if session_id and session_id in conversations:
        del conversations[session_id]

    return jsonify({'status': 'ok'})


def register_ai_routes(app):
    app.register_blueprint(ai_bp, url_prefix='/api/ai')