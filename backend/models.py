from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='client')
    status = db.Column(db.String(20), default='standard')
    bonus_points = db.Column(db.Integer, default=0)
    wallet_balance = db.Column(db.Integer, default=0)  # <-- ДОБАВЛЕНО
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Order', backref='user', lazy=True)
    estimates = db.relationship('Estimate', backref='user', lazy=True)
    page_views = db.relationship('PageView', backref='user', lazy=True)
    user_actions = db.relationship('UserAction', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'bonus_points': self.bonus_points,
            'wallet_balance': self.wallet_balance,
            'full_name': self.full_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PageView(db.Model):
    """модель для отслеживания просмотров страниц"""
    __tablename__ = 'page_views'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    session_id = db.Column(db.String(64), nullable=False)
    page_url = db.Column(db.String(500), nullable=False)
    page_name = db.Column(db.String(100), nullable=False)
    breadcrumbs = db.Column(db.Text, default='[]')
    referrer = db.Column(db.String(500))
    user_agent = db.Column(db.String(500))
    ip_address = db.Column(db.String(45))
    time_spent = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.user.email if self.user else None,
            'session_id': self.session_id,
            'page_url': self.page_url,
            'page_name': self.page_name,
            'breadcrumbs': json.loads(self.breadcrumbs) if self.breadcrumbs else [],
            'time_spent': self.time_spent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserAction(db.Model):
    """модель для отслеживания действий пользователя"""
    __tablename__ = 'user_actions'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    session_id = db.Column(db.String(64), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    action_target = db.Column(db.String(500))
    page_url = db.Column(db.String(500))
    additional_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': self.user.email if self.user else None,
            'session_id': self.session_id,
            'action_type': self.action_type,
            'action_target': self.action_target,
            'page_url': self.page_url,
            'additional_data': json.loads(self.additional_data) if self.additional_data else {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(50))
    version = db.Column(db.String(50))
    price = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer)
    description = db.Column(db.Text)
    image = db.Column(db.String(200))
    model_file = db.Column(db.String(200), default='helicopter.glb')
    in_stock = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Order', backref='product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model,
            'version': self.version,
            'price': self.price,
            'year': self.year,
            'description': self.description,
            'image': self.image,
            'model_file': self.model_file,
            'in_stock': self.in_stock
        }


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    total_price = db.Column(db.Integer, default=0)
    bonus_earned = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'status': self.status,
            'total_price': self.total_price,
            'bonus_earned': self.bonus_earned,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Estimate(db.Model):
    __tablename__ = 'estimates'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    model = db.Column(db.String(100))
    year = db.Column(db.Integer)
    hours = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'model': self.model,
            'year': self.year,
            'hours': self.hours,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }