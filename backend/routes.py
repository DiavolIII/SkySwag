from flask import request, jsonify, Blueprint
from models import db, User, Product, Order, Estimate, PageView, UserAction
from auth import token_required, hash_password, check_password, generate_token
import re
import json
import uuid
import logging
from config import Config
from cache import cached, invalidate_cache

logger = logging.getLogger('skywag.routes')
api_bp = Blueprint('api', __name__)


def validate_email(email):
    return re.match(r'^[^@]+@[^@]+\.[^@]+$', email)


# бонусные коэффициенты
BONUS_RATES = {
    'standard': 0.01,
    'premium': 0.03,
    'vip': 0.05
}


# ========== ПОЛУЧЕНИЕ ИЛИ СОЗДАНИЕ SESSION ID ==========
def get_or_create_session_id():
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id


# ========== ТРЕКИНГ ПРОСМОТРОВ СТРАНИЦ ==========
@api_bp.route('/track/page-view', methods=['POST'])
def track_page_view():
    data = request.json
    session_id = get_or_create_session_id()
    
    page_view = PageView(
        user_id=request.current_user.id if hasattr(request, 'current_user') else None,
        session_id=session_id,
        page_url=data.get('page_url', ''),
        page_name=data.get('page_name', ''),
        breadcrumbs=json.dumps(data.get('breadcrumbs', [])),
        referrer=data.get('referrer', ''),
        user_agent=request.headers.get('User-Agent', ''),
        ip_address=request.remote_addr
    )
    db.session.add(page_view)
    db.session.commit()
    
    return jsonify({'session_id': session_id}), 200


@api_bp.route('/track/page-time', methods=['POST'])
def track_page_time():
    data = request.json
    session_id = get_or_create_session_id()
    
    page_view = PageView.query.filter_by(
        session_id=session_id,
        page_url=data.get('page_url')
    ).order_by(PageView.created_at.desc()).first()
    
    if page_view:
        page_view.time_spent = data.get('time_spent', 0)
        db.session.commit()
    
    return jsonify({'status': 'ok'}), 200


@api_bp.route('/track/action', methods=['POST'])
def track_user_action():
    data = request.json
    session_id = get_or_create_session_id()
    
    user_action = UserAction(
        user_id=request.current_user.id if hasattr(request, 'current_user') else None,
        session_id=session_id,
        action_type=data.get('action_type', 'click'),
        action_target=data.get('action_target', ''),
        page_url=data.get('page_url', ''),
        additional_data=json.dumps(data.get('additional_data', {}))
    )
    db.session.add(user_action)
    db.session.commit()
    
    return jsonify({'status': 'ok'}), 200


# ========== ПУБЛИЧНЫЕ ЭНДПОИНТЫ ==========

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', '')
    phone = data.get('phone', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password too short (min 6 chars)'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        email=email, 
        password_hash=hash_password(password),
        full_name=full_name,
        phone=phone,
        status='standard',
        bonus_points=100,
        wallet_balance=0
    )
    db.session.add(user)
    db.session.commit()
    token = generate_token(user.id, user.role)
    logger.info(f"New user registered: {email}")
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@api_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        logger.warning(f"Failed login attempt for: {email}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user.id, user.role)
    logger.info(f"User logged in: {email}")
    return jsonify({'token': token, 'user': user.to_dict()})


@api_bp.route('/me', methods=['GET'])
@token_required
def me():
    return jsonify(request.current_user.to_dict())


@api_bp.route('/profile/update', methods=['PUT'])
@token_required
def update_profile():
    data = request.json
    user = request.current_user
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    return jsonify(user.to_dict())


# ========== КОШЕЛЕК ==========

@api_bp.route('/wallet/balance', methods=['GET'])
@token_required
def get_wallet_balance():
    """Получить баланс кошелька"""
    return jsonify({
        'balance': request.current_user.wallet_balance,
        'bonus': request.current_user.bonus_points
    })


@api_bp.route('/wallet/recharge', methods=['POST'])
@token_required
def recharge_wallet():
    """Пополнение кошелька"""
    data = request.json
    amount = data.get('amount', 0)
    
    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400
    
    user = request.current_user
    user.wallet_balance += amount
    db.session.commit()
    
    # Логируем действие
    user_action = UserAction(
        user_id=user.id,
        session_id=get_or_create_session_id(),
        action_type='recharge',
        action_target='wallet',
        page_url='/profile.html',
        additional_data=json.dumps({'amount': amount})
    )
    db.session.add(user_action)
    db.session.commit()
    
    logger.info(f"User {user.email} recharged wallet with {amount}€")
    
    return jsonify({
        'success': True,
        'new_balance': user.wallet_balance,
        'message': f'Баланс пополнен на {amount} €'
    }), 200


# ========== ПРОДУКТЫ С ПАГИНАЦИЕЙ И КЭШИРОВАНИЕМ ==========

@api_bp.route('/products', methods=['GET'])
@cached(ttl=300)
def get_products():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', Config.DEFAULT_PAGE_SIZE, type=int)
    
    if page_size > Config.MAX_PAGE_SIZE:
        page_size = Config.MAX_PAGE_SIZE
    
    search = request.args.get('q', None)
    min_price = request.args.get('min_price', None, type=int)
    max_price = request.args.get('max_price', None, type=int)
    model = request.args.get('model', None)
    in_stock = request.args.get('in_stock', None)
    
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    query = Product.query
    
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%') | Product.model.ilike(f'%{search}%'))
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    if model:
        query = query.filter(Product.model.ilike(f'%{model}%'))
    if in_stock is not None:
        query = query.filter(Product.in_stock == (in_stock.lower() == 'true'))
    
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    paginated = query.paginate(page=page, per_page=page_size, error_out=False)
    
    logger.info(f"Products query: page={page}, size={page_size}, total={paginated.total}")
    
    return jsonify({
        'data': [p.to_dict() for p in paginated.items],
        'count': paginated.total,
        'page': page,
        'page_size': page_size,
        'total_pages': paginated.pages,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev
    })


@api_bp.route('/products/<product_id>', methods=['GET'])
@cached(ttl=600)
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict())


# ========== ЗАКАЗЫ ==========

@api_bp.route('/orders', methods=['POST'])
@token_required
def create_order():
    data = request.json
    product = Product.query.get(data.get('product_id'))
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    user = request.current_user
    bonus_rate = BONUS_RATES.get(user.status, 0.01)
    bonus_earned = int(product.price * bonus_rate)
    
    order = Order(
        user_id=user.id,
        product_id=product.id,
        total_price=product.price,
        bonus_earned=bonus_earned
    )
    
    user.bonus_points += bonus_earned
    
    if user.bonus_points >= 10000 and user.status == 'standard':
        user.status = 'premium'
    elif user.bonus_points >= 50000 and user.status == 'premium':
        user.status = 'vip'
    
    db.session.add(order)
    db.session.commit()
    
    invalidate_cache('admin_stats')
    logger.info(f"Order created: user={user.email}, product={product.name}, bonus={bonus_earned}")
    
    return jsonify({
        'order': order.to_dict(),
        'bonus_earned': bonus_earned,
        'total_bonus': user.bonus_points,
        'new_status': user.status
    }), 201


@api_bp.route('/orders', methods=['GET'])
@token_required
def get_orders():
    orders = Order.query.filter_by(user_id=request.current_user.id).all()
    return jsonify({'data': [o.to_dict() for o in orders]})


@api_bp.route('/estimates', methods=['POST'])
def create_estimate():
    data = request.json
    if not data.get('name') or len(data.get('name', '')) < 2:
        return jsonify({'error': 'Name too short'}), 400
    
    phone_digits = re.sub(r'\D', '', data.get('phone', ''))
    if len(phone_digits) < 10:
        return jsonify({'error': 'Invalid phone number'}), 400
    
    estimate = Estimate(
        name=data['name'],
        phone=data['phone'],
        model=data.get('model'),
        year=data.get('year'),
        hours=data.get('hours'),
        user_id=request.current_user.id if hasattr(request, 'current_user') else None
    )
    db.session.add(estimate)
    db.session.commit()
    return jsonify(estimate.to_dict()), 201


# ========== АДМИНСКИЕ ЭНДПОИНТЫ ==========

@api_bp.route('/admin/super/login', methods=['POST'])
def super_admin_login():
    data = request.json
    password = data.get('password')
    
    if password == Config.SUPER_ADMIN_PASSWORD:
        token = generate_token('super_admin', 'super_admin')
        logger.info("Super admin login successful")
        return jsonify({'token': token, 'role': 'super_admin'}), 200
    
    logger.warning("Super admin login failed")
    return jsonify({'error': 'Invalid super admin password'}), 401


@api_bp.route('/admin/users', methods=['GET'])
@token_required
def admin_get_users():
    if request.current_user.role != 'admin' and request.current_user.id != 'super_admin':
        return jsonify({'error': 'Forbidden'}), 403
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


@api_bp.route('/admin/users/<user_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def admin_manage_user(user_id):
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if request.method == 'GET':
        return jsonify(user.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'status' in data:
            user.status = data['status']
        if 'role' in data:
            user.role = data['role']
        if 'bonus_points' in data:
            user.bonus_points = data['bonus_points']
        if 'wallet_balance' in data:
            user.wallet_balance = data['wallet_balance']
        db.session.commit()
        return jsonify(user.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'}), 200


@api_bp.route('/admin/orders', methods=['GET'])
@token_required
def admin_get_orders():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    orders = Order.query.all()
    result = []
    for order in orders:
        order_dict = order.to_dict()
        user = User.query.get(order.user_id)
        product = Product.query.get(order.product_id)
        order_dict['user_email'] = user.email if user else None
        order_dict['product_name'] = product.name if product else None
        result.append(order_dict)
    return jsonify({'data': result, 'count': len(result)})


@api_bp.route('/admin/orders/<order_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def admin_manage_order(order_id):
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if request.method == 'GET':
        return jsonify(order.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        if 'status' in data:
            order.status = data['status']
        db.session.commit()
        return jsonify(order.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted'}), 200


@api_bp.route('/admin/products', methods=['GET', 'POST'])
@token_required
def admin_manage_products():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    if request.method == 'GET':
        products = Product.query.all()
        return jsonify({'data': [p.to_dict() for p in products], 'count': len(products)})
    
    elif request.method == 'POST':
        data = request.json
        product = Product(
            name=data['name'],
            model=data.get('model'),
            version=data.get('version'),
            price=data['price'],
            year=data.get('year'),
            description=data.get('description'),
            model_file=data.get('model_file', 'helicopter.glb'),
            in_stock=data.get('in_stock', True)
        )
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201


@api_bp.route('/admin/products/<product_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def admin_manage_product(product_id):
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    if request.method == 'GET':
        return jsonify(product.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        if 'name' in data:
            product.name = data['name']
        if 'model' in data:
            product.model = data['model']
        if 'version' in data:
            product.version = data['version']
        if 'price' in data:
            product.price = data['price']
        if 'year' in data:
            product.year = data['year']
        if 'description' in data:
            product.description = data['description']
        if 'model_file' in data:
            product.model_file = data['model_file']
        if 'in_stock' in data:
            product.in_stock = data['in_stock']
        db.session.commit()
        return jsonify(product.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted'}), 200


@api_bp.route('/admin/estimates', methods=['GET'])
@token_required
def admin_get_estimates():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    estimates = Estimate.query.all()
    return jsonify({'data': [e.to_dict() for e in estimates], 'count': len(estimates)})


@api_bp.route('/admin/estimates/<estimate_id>', methods=['DELETE'])
@token_required
def admin_delete_estimate(estimate_id):
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    estimate = Estimate.query.get(estimate_id)
    if not estimate:
        return jsonify({'error': 'Estimate not found'}), 404
    
    db.session.delete(estimate)
    db.session.commit()
    return jsonify({'message': 'Estimate deleted'}), 200


@api_bp.route('/admin/stats', methods=['GET'])
@token_required
def admin_get_stats():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    users_count = User.query.count()
    orders_count = Order.query.count()
    products_count = Product.query.count()
    estimates_count = Estimate.query.count()
    
    total_revenue = db.session.query(db.func.sum(Order.total_price)).scalar() or 0
    
    standard_users = User.query.filter_by(status='standard').count()
    premium_users = User.query.filter_by(status='premium').count()
    vip_users = User.query.filter_by(status='vip').count()
    
    return jsonify({
        'users': users_count,
        'orders': orders_count,
        'products': products_count,
        'estimates': estimates_count,
        'total_revenue': total_revenue,
        'standard_users': standard_users,
        'premium_users': premium_users,
        'vip_users': vip_users
    })


@api_bp.route('/admin/page-views', methods=['GET'])
@token_required
def admin_get_page_views():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    limit = request.args.get('limit', 100, type=int)
    page_views = PageView.query.order_by(PageView.created_at.desc()).limit(limit).all()
    return jsonify({'data': [pv.to_dict() for pv in page_views], 'count': len(page_views)})


@api_bp.route('/admin/user-actions', methods=['GET'])
@token_required
def admin_get_user_actions():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    limit = request.args.get('limit', 100, type=int)
    actions = UserAction.query.order_by(UserAction.created_at.desc()).limit(limit).all()
    return jsonify({'data': [a.to_dict() for a in actions], 'count': len(actions)})


@api_bp.route('/admin/analytics/popular-pages', methods=['GET'])
@token_required
def admin_get_popular_pages():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    from sqlalchemy import func
    popular = db.session.query(
        PageView.page_name,
        func.count(PageView.id).label('views')
    ).group_by(PageView.page_name).order_by(func.count(PageView.id).desc()).limit(20).all()
    
    return jsonify([{'page': p[0], 'views': p[1]} for p in popular])


@api_bp.route('/admin/analytics/user-activity', methods=['GET'])
@token_required
def admin_get_user_activity():
    if request.current_user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    days = request.args.get('days', 7, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    activity = db.session.query(
        func.date(PageView.created_at).label('date'),
        func.count(PageView.id).label('views'),
        func.count(func.distinct(PageView.user_id)).label('users')
    ).filter(PageView.created_at >= start_date).group_by(func.date(PageView.created_at)).order_by(func.date(PageView.created_at)).all()
    
    return jsonify([{
        'date': a[0],
        'views': a[1],
        'users': a[2]
    } for a in activity])


def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')