import sys, os, pytest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app
from models import db, User, Product

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # создать тестовый продукт
            p = Product(name='Test Heli', price=1000000)
            db.session.add(p)
            db.session.commit()
        yield client
        with app.app_context():
            db.drop_all()

def test_register(client):
    res = client.post('/api/register', json={'email':'test@test.com','password':'123456'})
    assert res.status_code == 201
    assert 'token' in res.json

def test_login(client):
    client.post('/api/register', json={'email':'test@test.com','password':'123456'})
    res = client.post('/api/login', json={'email':'test@test.com','password':'123456'})
    assert res.status_code == 200
    assert 'token' in res.json

def test_get_products(client):
    res = client.get('/api/products')
    assert res.status_code == 200
    assert len(res.json['data']) >= 1