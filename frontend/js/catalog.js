let currentPage = 1;
let totalPages = 1;
let totalProducts = 0;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('pageTransition')?.classList.remove('active');
    }, 1000);
    
    loadProducts();
    
    document.getElementById('searchInput')?.addEventListener('input', debounce(() => {
        currentPage = 1;
        loadProducts();
    }, 500));
    
    document.getElementById('sortSelect')?.addEventListener('change', () => {
        currentPage = 1;
        loadProducts();
    });
});

window.applyFilters = () => {
    currentPage = 1;
    loadProducts();
};

window.resetFilters = () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = '';
    currentPage = 1;
    loadProducts();
};

window.goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadProducts();
};

window.prevPage = () => {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
    }
};

window.nextPage = () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadProducts();
    }
};

// Маппинг моделей к файлам
const modelFileMap = {
    'h130': 'helicopter.glb',
    'h125': 'helicopter.glb',
    'r66': 'helicopter.glb',
    'h145': '38fdfead6bf44d4492524375dbc64ddb.glb',
    'ec145': 'eurocopter_ecreuil_ec145.glb',
    'merlin': 'merlin_mk2_helicopter.glb',
    'stealth': 'stealth_helicopter_-_wolf_.new_order.glb'
};

window.getModelFile = (product) => {
    if (!product) return 'helicopter.glb';
    
    const name = ((product.name || '') + ' ' + (product.version || '')).toLowerCase();
    const model = (product.model || '').toLowerCase();
    
    // Проверяем по имени модели
    for (const [key, file] of Object.entries(modelFileMap)) {
        if (name.includes(key) || model.includes(key)) {
            return file;
        }
    }
    return 'helicopter.glb';
};

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loadingState');
    const error = document.getElementById('errorState');
    const pagination = document.getElementById('pagination');
    const countElement = document.getElementById('productCount');
    const statsElement = document.getElementById('totalStats');
    
    loading.style.display = 'flex';
    grid.style.display = 'none';
    error.style.display = 'none';
    if (pagination) pagination.style.display = 'none';
    if (countElement) countElement.style.display = 'none';
    
    try {
        const params = new URLSearchParams();
        
        const searchQuery = document.getElementById('searchInput')?.value;
        if (searchQuery) params.append('q', searchQuery);
        
        const minPrice = document.getElementById('minPrice')?.value;
        if (minPrice && !isNaN(minPrice) && minPrice > 0) {
            params.append('min_price', minPrice);
        }
        
        const maxPrice = document.getElementById('maxPrice')?.value;
        if (maxPrice && !isNaN(maxPrice) && maxPrice > 0) {
            params.append('max_price', maxPrice);
        }
        
        console.log('📡 Запрос к API...');
        
        let response;
        try {
            response = await fetch(`http://localhost:5000/api/products?${params}`);
        } catch (networkError) {
            console.warn('⚠️ Сервер не доступен, используем мок-данные');
            response = await getMockResponse(params);
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        totalProducts = data.count || 0;
        totalPages = Math.ceil(totalProducts / 6);
        
        if (statsElement) {
            statsElement.textContent = `📦 Всего моделей: ${totalProducts}`;
        }
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(product => {
                const modelFile = window.getModelFile(product);
                const imageUrl = product.image || `https://placehold.co/400x300/141414/d4af37?text=${product.model || product.name}`;
                return `
                    <div class="product-card" onclick="navigateTo('product.html?id=${product.id}')">
                        <div style="width:100%; height:160px; background:url('${imageUrl}') center/cover no-repeat; border-radius:15px; margin-bottom:1rem;"></div>
                        <div class="card-model">${product.model || product.name.split(' ')[1] || ''}</div>
                        <div class="card-title">${product.name} ${product.version || ''}</div>
                        <div class="card-price">${formatPrice(product.price)} €</div>
                        <div class="card-year">${product.year || 2025} год</div>
                        <button class="view-3d-btn" onclick="event.stopPropagation(); open3DViewer('${modelFile}', '${product.name} ${product.version || ''}')" title="Посмотреть 3D модель">3D</button>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #888;">🔍 Товары не найдены</div>';
        }
        
        updatePagination(currentPage, totalPages);
        
        if (countElement) {
            countElement.textContent = `📦 Показано ${data.data?.length || 0} из ${totalProducts} товаров`;
            countElement.style.display = 'block';
        }
        
        loading.style.display = 'none';
        grid.style.display = 'grid';
        if (pagination) pagination.style.display = 'flex';
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
    }
}

function updatePagination(current, total) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (total <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    html += `<button onclick="prevPage()" ${current === 1 ? 'disabled' : ''}>←</button>`;
    
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
        html += `<button onclick="goToPage(1)">1</button>`;
        if (start > 2) html += `<span style="color: #888;">...</span>`;
    }
    
    for (let i = start; i <= end; i++) {
        html += `<button onclick="goToPage(${i})" class="${i === current ? 'active' : ''}">${i}</button>`;
    }
    
    if (end < total) {
        if (end < total - 1) html += `<span style="color: #888;">...</span>`;
        html += `<button onclick="goToPage(${total})">${total}</button>`;
    }
    
    html += `<button onclick="nextPage()" ${current === total ? 'disabled' : ''}>→</button>`;
    
    pagination.innerHTML = html;
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function getMockResponse(params) {
    const mockProducts = [
        { id: "h130-basic", name: "Airbus H130", model: "H130", version: "Basic", price: 6100000, year: 2025, model_file: "helicopter.glb" },
        { id: "h130-middle", name: "Airbus H130", model: "H130", version: "Middle", price: 6230000, year: 2025, model_file: "helicopter.glb" },
        { id: "h125", name: "Airbus H125", model: "H125", version: "Standard", price: 4550000, year: 2024, model_file: "helicopter.glb" },
        { id: "r66", name: "Robinson R66", model: "R66", version: "Turbine", price: 1600000, year: 2025, model_file: "helicopter.glb" },
        { id: "h145", name: "Airbus H145", model: "H145", version: "Premium", price: 8900000, year: 2025, model_file: "38fdfead6bf44d4492524375dbc64ddb.glb" },
        { id: "ec145", name: "Eurocopter EC145", model: "EC145", version: "Standard", price: 7500000, year: 2024, model_file: "eurocopter_ecreuil_ec145.glb" },
        { id: "merlin", name: "Merlin MK2", model: "Merlin", version: "Military", price: 12000000, year: 2023, model_file: "merlin_mk2_helicopter.glb" },
        { id: "stealth", name: "Stealth Wolf", model: "Stealth", version: "Special", price: 25000000, year: 2025, model_file: "stealth_helicopter_-_wolf_.new_order.glb" }
    ];
    
    let filtered = [...mockProducts];
    
    const q = params.get('q');
    if (q) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.model.toLowerCase().includes(q.toLowerCase())
        );
    }
    
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
    
    const sort = params.get('sort');
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name_desc') filtered.sort((a, b) => b.name.localeCompare(a.name));
    
    return {
        ok: true,
        json: async () => ({
            data: filtered,
            count: filtered.length
        })
    };
}

window.loadProducts = loadProducts;