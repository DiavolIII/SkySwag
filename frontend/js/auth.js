let currentUser = null;

// константы
const API_BASE = 'http://localhost:5000/api';
const TOKEN_KEY = 'skywag_token';

// получение токена
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// сохранение токена
function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        console.log('✅ Токен сохранен');
    }
}

// удаление токена
function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    console.log('🗑️ Токен удален');
}

// проверка авторизации и обновление UI
async function checkAuth() {
    const token = getToken();
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (!token) {
        currentUser = null;
        updateAuthUI();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
            console.log('👤 Пользователь авторизован:', currentUser.email);
            
            // обновляем профиль если на странице профиля
            if (window.location.pathname.includes('profile.html') && typeof window.loadProfile === 'function') {
                window.loadProfile();
            }
            return true;
        } else {
            removeToken();
            currentUser = null;
            updateAuthUI();
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        currentUser = null;
        updateAuthUI();
        return false;
    }
}

// обновление ui авторизации
function updateAuthUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (!currentUser) {
        authContainer.innerHTML = `
            <div class="auth-buttons" style="display: flex; gap: 0.5rem;">
                <button class="action-btn auth-btn" onclick="showLoginModal()" style="padding: 0.4rem 1rem; font-size: 0.8rem; cursor: pointer; transition: all 0.3s;">
                    🔑 Вход
                </button>
                <button class="action-btn auth-btn" onclick="showRegisterModal()" style="padding: 0.4rem 1rem; font-size: 0.8rem; cursor: pointer; transition: all 0.3s;">
                    📝 Регистрация
                </button>
            </div>
        `;
        return;
    }

    const statusClass = currentUser.status === 'vip' ? 'vip' :
                        (currentUser.status === 'premium' ? 'premium' : 'standard');
    const statusIcon = currentUser.status === 'vip' ? '👑' :
                       (currentUser.status === 'premium' ? '✨' : '⭐');
    const statusName = currentUser.status === 'vip' ? 'VIP' :
                       (currentUser.status === 'premium' ? 'Premium' : 'Standard');

    // маскируем НТ
    const maskedPhone = currentUser.phone ? 
        currentUser.phone.slice(0, 4) + '****' + currentUser.phone.slice(-2) : 
        '—';

    authContainer.innerHTML = `
        <div class="user-widget" onclick="toggleUserMenu()" style="
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 0.3rem 0.8rem;
            background: #1a1a1a;
            border-radius: 40px;
            border: 1px solid #d4af37;
            transition: all 0.3s;
            animation: slideInRight 0.3s ease;
        ">
            <div class="user-avatar-small" style="
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #d4af37, #e31b23);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            ">
                ${statusIcon}
            </div>
            <div class="user-info-small" style="margin-left: 0.5rem;">
                <div style="font-size: 0.8rem; color: #fff;">${currentUser.email.split('@')[0]}</div>
                <div style="font-size: 0.7rem; color: #d4af37;">${statusName}</div>
            </div>
            <div class="user-arrow" style="margin-left: 0.5rem; color: #d4af37;">▼</div>
        </div>
        <div class="user-menu" id="userMenu" style="
            position: absolute;
            top: 70px;
            right: 20px;
            width: 340px;
            background: linear-gradient(135deg, #141414, #0a0a0a);
            border: 1px solid #d4af37;
            border-radius: 20px;
            padding: 1rem;
            z-index: 1000;
            display: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: fadeInUp 0.2s ease;
        ">
            <div style="display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #333;">
                <div style="
                    width: 55px;
                    height: 55px;
                    background: linear-gradient(135deg, #d4af37, #e31b23);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                ">
                    ${statusIcon}
                </div>
                <div style="flex: 1;">
                    <div style="color: #fff; font-weight: bold; font-size: 1rem;">${currentUser.full_name || currentUser.email.split('@')[0]}</div>
                    <div style="color: #888; font-size: 0.75rem;">${currentUser.email}</div>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #333;">
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 1.3rem; font-weight: bold; color: #d4af37;">${(currentUser.bonus_points || 0).toLocaleString()}</div>
                    <div style="font-size: 0.7rem; color: #888;">бонусов</div>
                </div>
                <div style="flex: 1; text-align: center; cursor: pointer;" onclick="togglePhoneReveal(this)">
                    <div style="font-size: 1.3rem; font-weight: bold; color: #d4af37;" class="phone-display">${maskedPhone}</div>
                    <div style="font-size: 0.7rem; color: #888;">телефон (нажмите)</div>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; padding: 1rem 0; border-bottom: 1px solid #333;">
                <span style="padding: 0.3rem 1rem; border-radius: 20px; background: ${statusClass === 'vip' ? 'linear-gradient(135deg, #e31b23, #d4af37)' : statusClass === 'premium' ? 'linear-gradient(135deg, #d4af37, #e31b23)' : '#2c3e50'}; color: #fff; font-size: 0.8rem;">
                    ${statusIcon} ${statusName}
                </span>
                <span style="padding: 0.3rem 1rem; border-radius: 20px; background: #1a1a1a; color: #888; font-size: 0.8rem;">
                    ${currentUser.role === 'admin' ? '👑 Админ' : '🔒 Клиент'}
                </span>
            </div>
            <div style="margin-top: 0.5rem;">
                <div class="menu-item" onclick="navigateTo('profile'); closeUserMenu()" style="
                    padding: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #ccc;
                ">
                    <span>📊</span> Личный кабинет
                </div>
                <div class="menu-item" onclick="showBonusInfo(); closeUserMenu()" style="
                    padding: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #ccc;
                ">
                    <span>📈</span> Бонусная информация
                </div>
                <div style="height: 1px; background: #333; margin: 0.5rem 0;"></div>
                <div class="menu-item logout-item" onclick="logout(); closeUserMenu()" style="
                    padding: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #e31b23;
                ">
                    <span>📋</span> Выйти
                </div>
            </div>
        </div>
    `;

    // добавляем hover эффекты
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#1a1a1a';
            if (!item.classList.contains('logout-item')) {
                item.style.color = '#d4af37';
            }
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
            if (!item.classList.contains('logout-item')) {
                item.style.color = '#ccc';
            } else {
                item.style.color = '#e31b23';
            }
        });
    });
}

// показать/скрыть номер телефона
function togglePhoneReveal(element) {
    const phoneDisplay = element.querySelector('.phone-display');
    if (!phoneDisplay) return;
    
    if (phoneDisplay.getAttribute('data-revealed') === 'true') {
        // скрываем НТ
        const maskedPhone = currentUser.phone ? 
            currentUser.phone.slice(0, 4) + '****' + currentUser.phone.slice(-2) : 
            '—';
        phoneDisplay.textContent = maskedPhone;
        phoneDisplay.setAttribute('data-revealed', 'false');
    } else {
        // показываем
        phoneDisplay.textContent = currentUser.phone || '—';
        phoneDisplay.setAttribute('data-revealed', 'true');
        
        // через 3 секунды автоматически скрываем
        setTimeout(() => {
            if (phoneDisplay.getAttribute('data-revealed') === 'true') {
                const maskedPhone = currentUser.phone ? 
                    currentUser.phone.slice(0, 4) + '****' + currentUser.phone.slice(-2) : 
                    '—';
                phoneDisplay.textContent = maskedPhone;
                phoneDisplay.setAttribute('data-revealed', 'false');
            }
        }, 3000);
    }
}

// переключение меню пользователя
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function closeUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
}

// закрытие меню при клике вне
document.addEventListener('click', (event) => {
    const widget = document.querySelector('.user-widget');
    const menu = document.getElementById('userMenu');
    if (widget && menu && !widget.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// функция входа
window.loginUser = async () => {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showNotification('Заполните email и пароль', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            closeModal();
            showNotification(`Добро пожаловать, ${data.user.email}!`, 'success');
            
            // обновляем пользователя и профиль
            await checkAuth();
            
            // если на странице профиля - перезагружаем
            if (window.location.pathname.includes('profile.html')) {
                window.location.reload();
            }
        } else {
            showNotification(data.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
};

// функция регистрации
window.registerUser = async () => {
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    const name = document.getElementById('regName')?.value;
    const phone = document.getElementById('regPhone')?.value;

    if (!email || !password) {
        showNotification('Заполните email и пароль', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Пароль должен быть минимум 6 символов', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: name, phone })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            closeModal();
            showNotification('Регистрация успешна! Получено 100 бонусов!', 'success');
            
            // обновляем пользователя и профиль
            await checkAuth();
            
            // если на странице профиля - перезагружаем
            if (window.location.pathname.includes('profile.html')) {
                window.location.reload();
            }
        } else {
            showNotification(data.error || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
};

// функция выхода
window.logout = () => {
    removeToken();
    currentUser = null;
    updateAuthUI();
    showNotification('Вы вышли из аккаунта', 'info');

    if (window.location.pathname.includes('profile.html')) {
        window.location.reload();
    }
};

// показать модальное окно входа
window.showLoginModal = () => {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.animation = 'fadeIn 0.3s ease';
    modal.innerHTML = `
        <div class="auth-modal-content" style="animation: scaleIn 0.3s ease;">
            <div class="auth-modal-header">
                <h2>🔑 Вход в SkySwag</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <form onsubmit="event.preventDefault(); loginUser()">
                <input type="email" id="loginEmail" placeholder="Email" autocomplete="email" style="transition: all 0.3s;">
                <input type="password" id="loginPassword" placeholder="Пароль" autocomplete="current-password" style="transition: all 0.3s;">
                <button type="submit" class="action-btn" style="width:100%; margin-top: 0.5rem; transition: all 0.3s;">Войти</button>
            </form>
            <p style="text-align:center; margin-top:1rem;">
                Нет аккаунта? 
                <a href="#" onclick="closeModal(); showRegisterModal();" style="color: #d4af37;">Зарегистрируйтесь</a>
            </p>
        </div>
    `;
    document.body.appendChild(modal);
};

// показать модальное окно регистрации
window.showRegisterModal = () => {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.animation = 'fadeIn 0.3s ease';
    modal.innerHTML = `
        <div class="auth-modal-content" style="animation: scaleIn 0.3s ease;">
            <div class="auth-modal-header">
                <h2>📝 Регистрация</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <form onsubmit="event.preventDefault(); registerUser()">
                <input type="text" id="regName" placeholder="Полное имя" style="transition: all 0.3s;">
                <input type="tel" id="regPhone" placeholder="Телефон" style="transition: all 0.3s;">
                <input type="email" id="regEmail" placeholder="Email" autocomplete="email" style="transition: all 0.3s;">
                <input type="password" id="regPassword" placeholder="Пароль (мин. 6 символов)" autocomplete="new-password" style="transition: all 0.3s;">
                <button type="submit" class="action-btn" style="width:100%; margin-top: 0.5rem; transition: all 0.3s;">Зарегистрироваться</button>
            </form>
            <p style="text-align:center; margin-top:1rem;">
                🎁 При регистрации вы получите 100 бонусов!
            </p>
            <p style="text-align:center;">
                Уже есть аккаунт? 
                <a href="#" onclick="closeModal(); showLoginModal();" style="color: #d4af37;">Войдите</a>
            </p>
        </div>
    `;
    document.body.appendChild(modal);
};

// закрыть модальное окно
window.closeModal = () => {
    const modal = document.querySelector('.auth-modal');
    if (modal) modal.remove();
};

// показать информацию о бонусах
window.showBonusInfo = () => {
    if (!currentUser) return;

    const nextThreshold = currentUser.status === 'standard' ? 10000 :
                         (currentUser.status === 'premium' ? 50000 : 0);
    const nextStatus = currentUser.status === 'standard' ? 'Premium' :
                      (currentUser.status === 'premium' ? 'VIP' : 'Максимум');
    const remaining = Math.max(0, nextThreshold - (currentUser.bonus_points || 0));

    showNotification(`⭐ Статус: ${currentUser.status.toUpperCase()}\n🎯 Бонусов: ${(currentUser.bonus_points || 0).toLocaleString()}\n📈 До ${nextStatus}: ${remaining.toLocaleString()} бонусов`, 'info');
};

// показать уведомление
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
        white-space: pre-line;
        max-width: 350px;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// добавляем стили для анимаций
const authStyles = document.createElement('style');
authStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeInUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    .auth-modal-content {
        background: linear-gradient(135deg, #141414, #0a0a0a);
        border: 2px solid #d4af37;
        border-radius: 30px;
        padding: 2rem;
        max-width: 450px;
        width: 90%;
    }
    .auth-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    .auth-modal-header h2 {
        color: #d4af37;
        margin: 0;
        font-size: 1.5rem;
    }
    .close-modal {
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
    .close-modal:hover {
        transform: rotate(90deg);
        background: #d4af37;
        color: #000;
    }
    .auth-modal-content input {
        width: 100%;
        padding: 0.8rem 1rem;
        margin: 0.5rem 0;
        background: #1a1a1a;
        border: 1px solid #d4af37;
        border-radius: 15px;
        color: #fff;
        transition: all 0.3s;
    }
    .auth-modal-content input:focus {
        outline: none;
        border-color: #e31b23;
        box-shadow: 0 0 10px rgba(227,27,35,0.3);
        transform: scale(1.02);
    }
    .auth-modal-content a {
        color: #d4af37;
        text-decoration: none;
        transition: all 0.3s;
    }
    .auth-modal-content a:hover {
        text-decoration: underline;
    }
    .user-widget {
        animation: slideInRight 0.3s ease;
    }
    .user-widget:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
    }
    .menu-item {
        transition: all 0.3s;
    }
    .menu-item:hover {
        transform: translateX(5px);
    }
    .phone-display {
        transition: all 0.3s;
        cursor: pointer;
    }
    .phone-display:hover {
        transform: scale(1.05);
        color: #e31b23;
    }
`;
document.head.appendChild(authStyles);

// инициализация
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});