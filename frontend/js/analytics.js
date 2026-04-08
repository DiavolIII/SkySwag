function getSessionId() {
    let sessionId = sessionStorage.getItem('skywag_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        sessionStorage.setItem('skywag_session_id', sessionId);
    }
    return sessionId;
}

// отправка просмотра страницы
async function trackPageView(pageName, breadcrumbs, pageUrl) {
    const sessionId = getSessionId();
    const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'X-Session-ID': sessionId };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    try {
        await fetch('http://localhost:5000/api/track/page-view', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                page_name: pageName,
                page_url: pageUrl || window.location.pathname,
                breadcrumbs: breadcrumbs,
                referrer: document.referrer
            })
        });
    } catch(e) { console.log('Track error:', e); }
    
    // запоминаем время входа на страницу
    sessionStorage.setItem('page_enter_time', Date.now());
    sessionStorage.setItem('current_page', pageUrl || window.location.pathname);
}

// обновление времени на странице
async function trackPageTime() {
    const enterTime = sessionStorage.getItem('page_enter_time');
    const currentPage = sessionStorage.getItem('current_page');
    if (enterTime && currentPage) {
        const timeSpent = Math.floor((Date.now() - parseInt(enterTime)) / 1000);
        if (timeSpent > 0) {
            const sessionId = getSessionId();
            const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json', 'X-Session-ID': sessionId };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            
            try {
                await fetch('http://localhost:5000/api/track/page-time', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        page_url: currentPage,
                        time_spent: timeSpent
                    })
                });
            } catch(e) { console.log('Track time error:', e); }
        }
    }
}

// отправка действия пользователя
async function trackAction(actionType, actionTarget, additionalData = {}) {
    const sessionId = getSessionId();
    const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'X-Session-ID': sessionId };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    try {
        await fetch('http://localhost:5000/api/track/action', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                action_type: actionType,
                action_target: actionTarget,
                page_url: window.location.pathname,
                additional_data: additionalData
            })
        });
    } catch(e) { console.log('Track action error:', e); }
}

// обновление времени при уходе со страницы
window.addEventListener('beforeunload', () => {
    trackPageTime();
});

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // отправляем просмотр страницы после загрузки
    setTimeout(() => {
        trackPageTime(); // отправляем время с предыдущей страницы
    }, 100);
});

// функция для создания
function createBreadcrumbs(pages) {
    const container = document.getElementById('breadcrumbs');
    if (!container) return;
    
    let html = '<div class="breadcrumbs" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; margin-bottom: 1rem; color: #888; font-size: 0.85rem;">';
    html += '<span>🏠</span>';
    
    pages.forEach((page, index) => {
        if (index > 0) html += '<span style="color: #d4af37;">→</span>';
        if (page.url) {
            html += `<a href="${page.url}" style="color: #d4af37; text-decoration: none; transition: color 0.3s;" onmouseover="this.style.color='#e31b23'" onmouseout="this.style.color='#d4af37'">${page.name}</a>`;
        } else {
            html += `<span style="color: #fff;">${page.name}</span>`;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// функция для отправки просмотра
function initPageTracking(pageName, breadcrumbsArray) {
    trackPageView(pageName, breadcrumbsArray);
    
    // отслеживаем клики
    document.querySelectorAll('a, button, .nav-item, .product-card, .service-card, .model-option, .color-option, .extra-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const targetText = target.textContent?.trim() || target.className || 'unknown';
            trackAction('click', targetText, { tagName: target.tagName });
        });
    });
    
    // отслеживаем отправку форм
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            trackAction('submit', form.id || form.className || 'form');
        });
    });
    
    // отслеживаем скролл (один раз при прокрутке более 50%)
    let scrollTracked = false;
    window.addEventListener('scroll', () => {
        if (!scrollTracked && (window.scrollY + window.innerHeight) / document.body.scrollHeight > 0.5) {
            scrollTracked = true;
            trackAction('scroll', '50%');
        }
    });
}