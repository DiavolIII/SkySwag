import jwt
import bcrypt
from datetime import datetime, timedelta
from flask import request, jsonify, current_app
from functools import wraps
from models import db, User

def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token missing'}), 401
        token = token.split(' ')[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated