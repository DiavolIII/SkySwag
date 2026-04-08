from functools import wraps
from flask import request, jsonify, session
from config import Config
import logging

logger = logging.getLogger('skywag.admin')

def super_admin_required(f):
    """lекоратор для защиты супер админ эндпоинтов"""
    @wraps(f)
    def decorated(*args, **kwargs):
        password = request.headers.get('X-Admin-Password')
        session_auth = session.get('super_admin_authenticated', False)
        
        if password == Config.SUPER_ADMIN_PASSWORD or session_auth:
            return f(*args, **kwargs)
        
        logger.warning(f"Unauthorized super admin access attempt from {request.remote_addr}")
        return jsonify({'error': 'Super admin access required'}), 401
    return decorated


def init_super_admin_session():
    """bнициализация сессии супер админа после успешного входа"""
    session['super_admin_authenticated'] = True
    session.permanent = True