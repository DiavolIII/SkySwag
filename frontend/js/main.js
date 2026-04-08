// main.js - Глобальная логика сайта SkySwag
// Версия 3.0 - Полноценная система с админ-панелью и бонусами

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
window.currentUser = null;
window.isAdmin = false;

// ========== НАВИГАЦИЯ ==========
window.navigateTo = (page) => {
    const transition = document.getElementById('pageTransition');
    if (transition) {
        transition.classList.add('active');
    }
    
    setTimeout(() => {
        let url = '';
        switch(page) {
            case 'index': url = 'index.html'; break;
            case 'catalog': url = 'catalog.html'; break;
            case 'services': url = 'services.html'; break;
            case 'about': url = 'about.html'; break;
            case 'news': url = 'news.html'; break;
            case 'leasing': url = 'leasing.html'; break;
            case 'configurator': url = 'configurator.html'; break;
            case 'profile': url = 'profile.html'; break;
            case 'admin-panel': url = 'admin-panel.html'; break;
            case 'view-model': url = 'view-model.html'; break;
            default: url = 'index.html';
        }
        window.location.href = url;
    }, 1000);
};

// ========== ЗАГРУЗКА СТРАНИЦЫ ==========
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const transition = document.getElementById('pageTransition');
        if (transition) {
            transition.classList.remove('active');
        }
    }, 1000);
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    highlightActiveNav(currentPage);
    
    if (currentPage === 'index.html' || currentPage === '') {
        loadPopularProducts();
        setupEstimateForm();
        initHero3D();
    }
    
    // Проверяем админ-доступ для отображения ссылки
    checkAdminAccessForNav();
    
    console.log(`🚁 SkySwag - Страница загружена: ${currentPage}`);
});

// ========== ПОДСВЕТКА АКТИВНОГО МЕНЮ ==========
function highlightActiveNav(currentPage) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        const text = item.textContent.trim().toLowerCase();
        const iconText = item.querySelector('.nav-icon')?.textContent || '';
        
        if (currentPage.includes('catalog') && (text.includes('каталог') || iconText.includes('🚁'))) {
            item.classList.add('active');
        } else if (currentPage.includes('services') && (text.includes('услуги') || iconText.includes('⚙️'))) {
            item.classList.add('active');
        } else if (currentPage.includes('about') && (text.includes('компании') || iconText.includes('ℹ️'))) {
            item.classList.add('active');
        } else if (currentPage.includes('news') && (text.includes('новости') || iconText.includes('📰'))) {
            item.classList.add('active');
        } else if (currentPage.includes('leasing') && (text.includes('лизинг') || iconText.includes('💰'))) {
            item.classList.add('active');
        } else if (currentPage.includes('configurator') && (text.includes('конфигуратор') || iconText.includes('🛠️'))) {
            item.classList.add('active');
        } else if (currentPage.includes('profile') && (text.includes('профиль') || iconText.includes('👤'))) {
            item.classList.add('active');
        } else if (currentPage.includes('admin') && (text.includes('admin') || iconText.includes('👑'))) {
            item.classList.add('active');
        }
    });
}

// ========== ПРОВЕРКА АДМИН-ДОСТУПА ДЛЯ НАВИГАЦИИ ==========
async function checkAdminAccessForNav() {
    const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const response = await fetch('http://localhost:5000/api/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (response.ok) {
            const user = await response.json();
            window.currentUser = user;
            window.isAdmin = user.role === 'admin';
            
            // добавляем ссылку на админ-панель если пользователь админ
            if (user.role === 'admin') {
                addAdminNavLink();
            }
            return true;
        }
    } catch (e) {
        console.error('Ошибка проверки админ-доступа:', e);
    }
    return false;
}

// ========== ДОБАВЛЕНИЕ ССЫЛКИ НА АДМИН-ПАНЕЛЬ ==========
function addAdminNavLink() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // проверяем, нет ли уже такой ссылки
    if (document.getElementById('adminNavLink')) return;
    
    const adminLink = document.createElement('span');
    adminLink.id = 'adminNavLink';
    adminLink.className = 'nav-item';
    adminLink.innerHTML = '<span class="nav-icon">👑</span><span>Admin</span>';
    adminLink.onclick = () => navigateTo('admin-panel');
    navLinks.appendChild(adminLink);
}

// ========== ЗАГРУЗКА ПОПУЛЯРНЫХ ТОВАРОВ ==========
async function loadPopularProducts() {
    const grid = document.getElementById('popularProducts');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Загрузка товаров...</p></div>';
    
    try {
        let data;
        try {
            const response = await fetch('http://localhost:5000/api/products?page_size=4');
            if (!response.ok) throw new Error('Сервер не отвечает');
            data = await response.json();
        } catch (serverError) {
            console.log('⚠️ Сервер не доступен, используем мок-данные');
            data = {
                data: [
                    { id: "h130-basic", name: "Airbus H130", model: "H130", version: "Basic", price: 6100000, year: 2025, model_file: "helicopter.glb" },
                    { id: "h130-middle", name: "Airbus H130", model: "H130", version: "Middle", price: 6230000, year: 2025, model_file: "helicopter.glb" },
                    { id: "h125", name: "Airbus H125", model: "H125", version: "Standard", price: 4550000, year: 2024, model_file: "helicopter.glb" },
                    { id: "r66", name: "Robinson R66", model: "R66", version: "Turbine", price: 1600000, year: 2025, model_file: "helicopter.glb" }
                ]
            };
        }
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(product => {
                const modelFile = getModelFile(product);
                const imageUrl = product.image || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231a1a1a'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23d4af37' font-size='48'%3E🚁%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%23888' font-size='14'%3E${product.model || product.name}%3C/text%3E%3C/svg%3E`;
                return `
                    <div class="product-card" onclick="navigateTo('catalog')">
                        <div style="width:100%; height:160px; background:url('${imageUrl}') center/cover no-repeat; border-radius:15px; margin-bottom:1rem;"></div>
                        <div class="card-model">${product.model || product.name.split(' ')[1] || 'HELICOPTER'}</div>
                        <div class="card-title">${product.name} ${product.version || ''}</div>
                        <div class="card-price">${formatPrice(product.price)} €</div>
                        <div class="card-year">${product.year || 2025} год</div>
                        <button class="view-3d-btn" onclick="event.stopPropagation(); open3DViewer('${modelFile}', '${product.name} ${product.version || ''}')" title="Посмотреть 3D модель">3D</button>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<div class="error-state">Не удалось загрузить товары</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        grid.innerHTML = '<div class="error-state">Не удалось загрузить товары</div>';
    }
}

// ========== ФОРМАТИРОВАНИЕ ЦЕНЫ ==========
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ========== ОПРЕДЕЛЕНИЕ ФАЙЛА МОДЕЛИ ==========
function getModelFile(product) {
    if (!product) return 'helicopter.glb';
    
    const name = ((product.name || '') + ' ' + (product.version || '')).toLowerCase();
    const model = (product.model || '').toLowerCase();
    const id = (product.id || '').toLowerCase();
    
    if (name.includes('h145') || model.includes('h145') || id.includes('h145')) {
        return '38fdfead6bf44d4492524375dbc64ddb.glb';
    } else if (name.includes('ec145') || model.includes('ec145') || name.includes('eurocopter')) {
        return 'eurocopter_ecreuil_ec145.glb';
    } else if (name.includes('merlin') || model.includes('merlin')) {
        return 'merlin_mk2_helicopter.glb';
    } else if (name.includes('stealth') || name.includes('wolf')) {
        return 'stealth_helicopter_-_wolf_.new_order.glb';
    } else {
        return 'helicopter.glb';
    }
}

// ========== ОТКРЫТИЕ 3D ПРОСМОТРЩИКА ==========
window.open3DViewer = (modelFile, modelName) => {
    const file = modelFile || 'helicopter.glb';
    const name = encodeURIComponent(modelName || '3D Модель');
    window.location.href = `view-model.html?file=${file}&name=${name}`;
};

// ========== ФОРМА ОЦЕНКИ ==========
function setupEstimateForm() {
    const form = document.getElementById('estimateForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (!data.name || !data.phone) {
            showNotification('Пожалуйста, заполните имя и телефон', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        try {
            const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            const response = await fetch('http://localhost:5000/api/estimates', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showNotification('✅ Заявка отправлена! Мы свяжемся с вами.', 'success');
                form.reset();
            } else {
                showNotification('❌ Ошибка отправки', 'error');
            }
        } catch (error) {
            showNotification('❌ Ошибка подключения к серверу', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== ФОРМА "ПОЛУЧИТЬ ПРЕДЛОЖЕНИЕ" ==========
window.showOfferForm = () => {
    const modal = document.createElement('div');
    modal.className = 'offer-modal';
    modal.innerHTML = `
        <div class="offer-modal-content">
            <div class="offer-modal-header">
                <h2>🚁 Получить предложение</h2>
                <button class="close-offer-modal" onclick="closeOfferModal()">&times;</button>
            </div>
            <form id="offerForm" onsubmit="submitOffer(event)">
                <div style="display: grid; gap: 1rem;">
                    <input type="text" id="offerName" placeholder="Ваше имя" required>
                    <input type="tel" id="offerPhone" placeholder="Телефон" required>
                    <input type="email" id="offerEmail" placeholder="Email">
                    <select id="offerModel">
                        <option value="">Выберите интересующую модель</option>
                        <option value="Airbus H125">Airbus H125 - от 4 550 000 €</option>
                        <option value="Airbus H130">Airbus H130 - от 6 100 000 €</option>
                        <option value="Airbus H145">Airbus H145 - от 8 900 000 €</option>
                        <option value="Robinson R66">Robinson R66 - от 1 600 000 €</option>
                        <option value="Eurocopter EC145">Eurocopter EC145 - от 7 500 000 €</option>
                        <option value="Merlin MK2">Merlin MK2 - от 12 000 000 €</option>
                        <option value="Stealth Wolf">Stealth Wolf - от 25 000 000 €</option>
                        <option value="Другая модель">Другая модель</option>
                    </select>
                    <select id="offerPurpose">
                        <option value="">Цель приобретения</option>
                        <option value="Личное использование">Личное использование</option>
                        <option value="Бизнес-перевозки">Бизнес-перевозки</option>
                        <option value="Корпоративный парк">Корпоративный парк</option>
                        <option value="Чартерные перевозки">Чартерные перевозки</option>
                        <option value="Медицинская служба">Медицинская служба</option>
                        <option value="Другое">Другое</option>
                    </select>
                    <textarea id="offerMessage" placeholder="Дополнительная информация или вопросы" rows="3"></textarea>
                </div>
                <div style="background: #1a1a1a; padding: 1rem; border-radius: 15px; margin: 1rem 0; font-size: 0.9rem;">
                    <p>📞 После отправки заявки наш менеджер свяжется с вами в течение 15 минут</p>
                    <p>🎁 При оформлении заказа через форму вы получите дополнительные 500 бонусов!</p>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">📩 Отправить заявку</button>
                <button type="button" class="btn btn-secondary" onclick="closeOfferModal()" style="width:100%; margin-top: 0.5rem;">Отмена</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    addOfferModalStyles();
};

function closeOfferModal() {
    const modal = document.querySelector('.offer-modal');
    if (modal) modal.remove();
}

async function submitOffer(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('offerName')?.value,
        phone: document.getElementById('offerPhone')?.value,
        email: document.getElementById('offerEmail')?.value,
        model: document.getElementById('offerModel')?.value,
        purpose: document.getElementById('offerPurpose')?.value,
        message: document.getElementById('offerMessage')?.value,
        type: 'offer_request'
    };
    
    if (!formData.name || !formData.phone) {
        showNotification('Пожалуйста, заполните имя и телефон', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#offerForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        const response = await fetch('http://localhost:5000/api/estimates', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('✅ Заявка успешно отправлена! Наш менеджер свяжется с вами.', 'success');
            closeOfferModal();
        } else {
            showNotification('❌ Ошибка отправки. Пожалуйста, попробуйте позже.', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка подключения к серверу. Проверьте интернет-соединение.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function addOfferModalStyles() {
    if (document.getElementById('offer-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'offer-modal-styles';
    styles.textContent = `
        .offer-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        .offer-modal-content {
            background: linear-gradient(135deg, #141414, #0a0a0a);
            border: 2px solid #d4af37;
            border-radius: 30px;
            padding: 2rem;
            max-width: 550px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease;
        }
        .offer-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        .offer-modal-header h2 {
            color: #d4af37;
            margin: 0;
            font-size: 1.5rem;
        }
        .close-offer-modal {
            background: #e31b23;
            border: none;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s;
        }
        .close-offer-modal:hover {
            transform: rotate(90deg);
            background: #d4af37;
            color: #000;
        }
        .offer-modal-content input,
        .offer-modal-content select,
        .offer-modal-content textarea {
            width: 100%;
            padding: 0.8rem 1rem;
            margin: 0.5rem 0;
            background: #1a1a1a;
            border: 1px solid #d4af37;
            border-radius: 15px;
            color: #fff;
            font-family: inherit;
            font-size: 0.9rem;
        }
        .offer-modal-content select option {
            background: #1a1a1a;
            color: #fff;
        }
        .offer-modal-content input:focus,
        .offer-modal-content select:focus,
        .offer-modal-content textarea:focus {
            outline: none;
            border-color: #e31b23;
            box-shadow: 0 0 10px rgba(227,27,35,0.3);
        }
        .btn-primary {
            background: linear-gradient(135deg, #d4af37, #e31b23);
            color: #000;
            border: none;
            padding: 0.8rem 1.8rem;
            border-radius: 40px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
        }
        .btn-secondary {
            background: transparent;
            border: 1px solid #d4af37;
            color: #d4af37;
            padding: 0.8rem 1.8rem;
            border-radius: 40px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        .btn-secondary:hover {
            background: #d4af37;
            color: #000;
            transform: translateY(-2px);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(styles);
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e31b23' : '#d4af37'};
        color: ${type === 'success' ? '#fff' : type === 'error' ? '#fff' : '#000'};
        border-radius: 15px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        font-family: 'Space Grotesk', sans-serif;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== 3D ИНИЦИАЛИЗАЦИЯ НА ГЛАВНОЙ ==========
async function initHero3D() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    
    try {
        const { initThreeScene } = await import('./three-setup.js');
        initThreeScene();
    } catch (error) {
        console.error('3D initialization failed:', error);
        canvas.style.background = 'linear-gradient(135deg, #1a1a1a, #0a0a0a)';
    }
}

// ========== ДОБАВЛЕНИЕ СТИЛЕЙ ==========
const globalStyles = document.createElement('style');
globalStyles.textContent = `
    .nav-item.active {
        color: #d4af37;
        border-bottom-color: #e31b23;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }
    
    .product-card {
        position: relative;
    }
    
    .loading-state {
        text-align: center;
        padding: 2rem;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #d4af37;
        border-top-color: #e31b23;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .error-state {
        text-align: center;
        padding: 2rem;
        color: #e31b23;
    }
`;
document.head.appendChild(globalStyles);