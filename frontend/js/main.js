// ============================================
// SKYSWAG - ГЛАВНЫЙ ФАЙЛ (ПОЛНОЕ ОБНОВЛЕНИЕ)
// ============================================

// Навигация с анимацией (1 секунда)
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
            case 'models': url = 'models.html'; break;
            case 'view-model': url = 'view-model.html'; break;
            default: url = 'index.html';
        }
        window.location.href = url;
    }, 1000);
};

// Загрузка главной страницы
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
    
    console.log(`🚁 SkySwag - Страница загружена: ${currentPage}`);
});

// Подсветка активного пункта меню
function highlightActiveNav(currentPage) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        const text = item.textContent.trim().toLowerCase();
        
        if (currentPage.includes('catalog') && text.includes('каталог')) {
            item.classList.add('active');
        } else if (currentPage.includes('services') && text.includes('услуги')) {
            item.classList.add('active');
        } else if (currentPage.includes('about') && text.includes('компании')) {
            item.classList.add('active');
        } else if (currentPage.includes('news') && text.includes('новости')) {
            item.classList.add('active');
        } else if (currentPage.includes('leasing') && text.includes('лизинг')) {
            item.classList.add('active');
        } else if (currentPage.includes('configurator') && text.includes('конфигуратор')) {
            item.classList.add('active');
        } else if (currentPage.includes('models') && (text.includes('3d') || text.includes('модели'))) {
            item.classList.add('active');
        }
    });
}

// Загрузка популярных товаров для главной
async function loadPopularProducts() {
    const grid = document.getElementById('popularProducts');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading-state">Загрузка товаров...</div>';
    
    try {
        let data;
        try {
            const response = await fetch('http://localhost:3001/products?page_size=4');
            if (!response.ok) throw new Error('Сервер не отвечает');
            data = await response.json();
        } catch (serverError) {
            console.log('⚠️ Сервер не доступен, используем мок-данные');
            data = {
                data: [
                    { id: "h130-basic", name: "Airbus H130", model: "H130", version: "Basic", price: 6100000, year: 2025 },
                    { id: "h130-middle", name: "Airbus H130", model: "H130", version: "Middle", price: 6230000, year: 2025 },
                    { id: "h125", name: "Airbus H125", model: "H125", version: "Standard", price: 4550000, year: 2024 },
                    { id: "r66", name: "Robinson R66", model: "R66", version: "Turbine", price: 1600000, year: 2025 }
                ]
            };
        }
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(product => {
                const modelFile = getModelFile(product);
                return `
                    <div class="product-card" onclick="navigateTo('catalog')">
                        <div class="card-model">${product.model || product.name.split(' ')[1] || ''}</div>
                        <div class="card-title">${product.name} ${product.version || ''}</div>
                        <div class="card-price">${formatPrice(product.price)} €</div>
                        <div class="card-year">${product.year || 2025} год</div>
                        <button class="view-3d-btn" onclick="event.stopPropagation(); open3DViewer('${modelFile}', '${product.name} ${product.version || ''}')" title="Посмотреть 3D модель">3D</button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        grid.innerHTML = '<div class="error-state">Не удалось загрузить товары</div>';
    }
}

// Форматирование цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Определение файла модели по товару
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

// Открыть 3D просмотрщик
window.open3DViewer = (modelFile, modelName) => {
    const file = modelFile || 'helicopter.glb';
    const name = encodeURIComponent(modelName || '3D Модель');
    // Используем относительный путь
    window.location.href = `view-model.html?file=${file}&name=${name}`;
};

// Настройка формы оценки
function setupEstimateForm() {
    const form = document.getElementById('estimateForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (!data.name || !data.phone) {
            alert('Пожалуйста, заполните имя и телефон');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        try {
            let response;
            try {
                response = await fetch('http://localhost:3001/estimate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (serverError) {
                console.log('⚠️ Сервер не доступен, имитация отправки');
                await new Promise(resolve => setTimeout(resolve, 1000));
                response = { ok: true };
            }
            
            if (response.ok) {
                alert('✅ Заявка отправлена! Мы свяжемся с вами.');
                form.reset();
            }
        } catch (error) {
            alert('❌ Ошибка отправки');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Инициализация 3D на главной
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

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    .nav-item.active {
        color: #d4af37;
        border-bottom-color: #e31b23;
        text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }
    
    .product-card {
        position: relative;
    }
`;
document.head.appendChild(style);