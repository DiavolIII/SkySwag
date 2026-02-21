"""
Модели данных для SkySwag
Подготовка к подключению PostgreSQL
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import uuid
from typing import Optional

class UserRole(str, Enum):
    """Роли пользователей"""
    GUEST = "guest"
    CLIENT = "client"
    MANAGER = "manager"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    """Статусы заказов"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

@dataclass
class Product:
    """Модель продукта (вертолета)"""
    id: str
    name: str
    model: Optional[str]
    version: Optional[str]
    price: int
    year: Optional[int]
    description: Optional[str]
    in_stock: bool = True
    created_at: datetime = None
    
    @classmethod
    def create(cls, name: str, price: int, **kwargs):
        """Создание нового продукта с генерацией ID"""
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            price=price,
            created_at=datetime.utcnow(),
            **kwargs
        )
    
    def to_dict(self):
        """Конвертация в словарь для JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model,
            'version': self.version,
            'price': self.price,
            'year': self.year,
            'description': self.description,
            'in_stock': self.in_stock
        }
    
    def validate(self):
        """Валидация полей продукта"""
        if not self.name or len(self.name) < 2:
            raise ValueError("Название должно содержать минимум 2 символа")
        
        if self.price <= 0:
            raise ValueError("Цена должна быть положительной")
        
        if self.year and (self.year < 2000 or self.year > 2030):
            raise ValueError("Год должен быть между 2000 и 2030")
        
        return True

@dataclass
class User:
    """Модель пользователя"""
    id: str
    email: str
    password_hash: str
    role: UserRole = UserRole.CLIENT
    created_at: datetime = None
    
    @classmethod
    def create(cls, email: str, password_hash: str, role: UserRole = UserRole.CLIENT):
        """Создание нового пользователя"""
        return cls(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=password_hash,
            role=role,
            created_at=datetime.utcnow()
        )
    
    def validate(self):
        """Валидация полей пользователя"""
        if '@' not in self.email or '.' not in self.email:
            raise ValueError("Некорректный email")
        
        if len(self.password_hash) < 6:
            raise ValueError("Пароль слишком короткий")
        
        return True

@dataclass
class Order:
    """Модель заказа"""
    id: str
    user_id: str
    product_id: str
    status: OrderStatus = OrderStatus.PENDING
    total_price: int = 0
    created_at: datetime = None
    
    @classmethod
    def create(cls, user_id: str, product_id: str, total_price: int):
        """Создание нового заказа"""
        return cls(
            id=str(uuid.uuid4()),
            user_id=user_id,
            product_id=product_id,
            total_price=total_price,
            created_at=datetime.utcnow()
        )
    
    def to_dict(self):
        """Конвертация в словарь"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'status': self.status.value,
            'total_price': self.total_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

@dataclass
class Estimate:
    """Модель заявки на оценку"""
    id: str
    name: str
    phone: str
    model: Optional[str]
    year: Optional[int]
    hours: Optional[int]
    created_at: datetime = None
    
    @classmethod
    def create(cls, name: str, phone: str, **kwargs):
        """Создание новой заявки"""
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            phone=phone,
            created_at=datetime.utcnow(),
            **kwargs
        )
    
    def validate(self):
        """Валидация заявки"""
        if not self.name or len(self.name) < 2:
            raise ValueError("Имя должно содержать минимум 2 символа")
        
        # Простая валидация телефона
        digits = ''.join(filter(str.isdigit, self.phone))
        if len(digits) < 10:
            raise ValueError("Некорректный номер телефона")
        
        if self.year and (self.year < 1900 or self.year > 2030):
            raise ValueError("Некорректный год")
        
        if self.hours and self.hours < 0:
            raise ValueError("Налет не может быть отрицательным")
        
        return True

# Примеры использования
if __name__ == "__main__":
    print("=" * 60)
    print("ТЕСТИРОВАНИЕ МОДЕЛЕЙ ДАННЫХ")
    print("=" * 60)
    
    # Создание продукта
    product = Product.create(
        name="Airbus H130",
        price=6100000,
        model="H130",
        version="Basic",
        year=2025,
        description="Легкий многоцелевой вертолет"
    )
    print(f"✓ Создан продукт: {product.name}")
    print(f"  ID: {product.id}")
    print(f"  Цена: {product.price} €")
    
    # Создание пользователя
    user = User.create(
        email="client@example.com",
        password_hash="hashed_password_123"
    )
    print(f"\n✓ Создан пользователь: {user.email}")
    print(f"  Роль: {user.role.value}")
    
    # Создание заказа
    order = Order.create(
        user_id=user.id,
        product_id=product.id,
        total_price=product.price
    )
    print(f"\n✓ Создан заказ: {order.id}")
    print(f"  Статус: {order.status.value}")
    
    # Создание заявки
    estimate = Estimate.create(
        name="Иван Петров",
        phone="+7 (999) 123-45-67",
        model="Airbus H130",
        year=2018,
        hours=1200
    )
    print(f"\n✓ Создана заявка от: {estimate.name}")
    print(f"  Телефон: {estimate.phone}")
    
    print("\n" + "=" * 60)
    print("ВСЕ МОДЕЛИ РАБОТАЮТ КОРРЕКТНО")
    print("=" * 60)