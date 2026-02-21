// Калькулятор лизинга
document.addEventListener('DOMContentLoaded', function() {
    const priceRange = document.getElementById('priceRange');
    const depositRange = document.getElementById('depositRange');
    const termRange = document.getElementById('termRange');
    
    if (priceRange) {
        priceRange.addEventListener('input', updateCalculator);
        depositRange.addEventListener('input', updateCalculator);
        termRange.addEventListener('input', updateCalculator);
        
        updateCalculator();
    }
});

function updateCalculator() {
    const price = parseFloat(document.getElementById('priceRange').value);
    const depositPercent = parseFloat(document.getElementById('depositRange').value);
    const term = parseFloat(document.getElementById('termRange').value);
    
    // Форматирование цены
    document.getElementById('priceValue').textContent = formatPrice(price) + ' €';
    document.getElementById('depositValue').textContent = depositPercent + '%';
    document.getElementById('termValue').textContent = term + ' лет';
    
    // Расчеты
    const deposit = price * depositPercent / 100;
    const loanAmount = price - deposit;
    const monthlyRate = 0.08 / 12; // 8% годовых
    const months = term * 12;
    const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const overpayment = totalPayment - loanAmount;
    
    document.getElementById('initialPayment').textContent = formatPrice(deposit) + ' €';
    document.getElementById('monthlyPayment').textContent = formatPrice(monthlyPayment) + ' €';
    document.getElementById('overpayment').textContent = formatPrice(overpayment) + ' €';
}

function formatPrice(price) {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

window.showLeasingForm = function() {
    const formHtml = `
        <div class="modal-overlay" onclick="hideModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <h2>Получить предложение по лизингу</h2>
                <form onsubmit="submitLeasingRequest(event)">
                    <input type="text" placeholder="Ваше имя" required>
                    <input type="tel" placeholder="Телефон" required>
                    <input type="email" placeholder="Email">
                    <textarea placeholder="Комментарий"></textarea>
                    <button type="submit" class="action-btn">Отправить</button>
                    <button type="button" class="action-btn" onclick="hideModal()">Отмена</button>
                </form>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = formHtml;
    document.body.appendChild(modal);
}

window.hideModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

window.submitLeasingRequest = function(event) {
    event.preventDefault();
    alert('Заявка отправлена! Мы свяжемся с вами.');
    hideModal();
}