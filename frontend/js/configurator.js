let currentModel = '';
let basePrice = 0;
let currentColor = '';
let currentInterior = '';
let extras = {
    ac: false,
    avionics: false,
    sound: false,
    extrafuel: false,
    vip: false
};

const modelPrices = {
    'h125': 4550000,
    'h130': 6100000,
    'r66': 1600000
};

const interiorPrices = {
    'leather_cream': 0,
    'leather_brown': 0,
    'alcantara': 15000,
    'vip': 75000,
    'executive': 120000
};

const extraPrices = {
    'ac': 45000,
    'avionics': 120000,
    'sound': 35000,
    'extrafuel': 60000,
    'vip': 95000
};

window.selectModel = function(model) {
    currentModel = model;
    basePrice = modelPrices[model];
    
    // Обновляем интерфейс
    document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    document.getElementById('previewModel').textContent = 
        model === 'h125' ? 'Airbus H125' : 
        model === 'h130' ? 'Airbus H130' : 'Robinson R66';
    
    // Показываем следующие секции
    document.getElementById('colorSection').style.display = 'block';
    document.getElementById('interiorSection').style.display = 'block';
    document.getElementById('extrasSection').style.display = 'block';
    document.getElementById('totalSection').style.display = 'block';
    
    updateTotal();
}

window.selectColor = function(color) {
    currentColor = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    const preview = document.querySelector('.preview-placeholder');
    preview.style.color = 
        color === 'black' ? '#000000' :
        color === 'white' ? '#ffffff' :
        color === 'red' ? '#e31b23' :
        color === 'gold' ? '#d4af37' :
        color === 'midnight' ? '#2c3e50' : '#87CEEB';
}

window.selectInterior = function(interior) {
    currentInterior = interior;
    updateTotal();
}

window.updateExtras = function() {
    document.querySelectorAll('#extrasSection input[type=checkbox]').forEach(cb => {
        extras[cb.value] = cb.checked;
    });
    updateTotal();
}

function updateTotal() {
    let total = basePrice;
    let breakdown = [`Базовая цена: ${formatPrice(basePrice)} €`];
    
    // Добавляем интерьер
    if (currentInterior && interiorPrices[currentInterior] > 0) {
        total += interiorPrices[currentInterior];
        breakdown.push(`Интерьер: +${formatPrice(interiorPrices[currentInterior])} €`);
    }
    
    // Добавляем допы
    for (let [key, value] of Object.entries(extras)) {
        if (value && extraPrices[key]) {
            total += extraPrices[key];
            breakdown.push(`${getExtraName(key)}: +${formatPrice(extraPrices[key])} €`);
        }
    }
    
    document.getElementById('totalPrice').textContent = formatPrice(total) + ' €';
    document.getElementById('priceBreakdown').innerHTML = breakdown.map(item => 
        `<div class="breakdown-item">${item}</div>`
    ).join('');
}

function getExtraName(key) {
    const names = {
        'ac': 'Кондиционер',
        'avionics': 'Улучшенная авионика',
        'sound': 'Шумоизоляция',
        'extrafuel': 'Доп. баки',
        'vip': 'VIP трансформация'
    };
    return names[key];
}

function formatPrice(price) {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

window.showOrderForm = function() {
    document.getElementById('orderForm').style.display = 'block';
}

window.hideOrderForm = function() {
    document.getElementById('orderForm').style.display = 'none';
}

window.submitOrder = function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orderData = {
        model: currentModel,
        color: currentColor,
        interior: currentInterior,
        extras: extras,
        total: calculateTotal(),
        ...Object.fromEntries(formData.entries())
    };
    
    console.log('Order:', orderData);
    alert('Заказ отправлен! Мы свяжемся с вами для подтверждения.');
    
    hideOrderForm();
    event.target.reset();
}

function calculateTotal() {
    let total = basePrice;
    if (currentInterior && interiorPrices[currentInterior]) {
        total += interiorPrices[currentInterior];
    }
    for (let [key, value] of Object.entries(extras)) {
        if (value && extraPrices[key]) {
            total += extraPrices[key];
        }
    }
    return total;
}