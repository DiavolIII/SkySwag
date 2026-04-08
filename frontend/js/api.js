const API_BASE = 'http://localhost:3001';

export async function fetchProducts(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });
    
    const response = await fetch(`${API_BASE}/products?${queryParams.toString()}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}

export async function fetchProductById(id) {
    const response = await fetch(`${API_BASE}/products/${id}`);
    
    if (!response.ok) {
        throw new Error(`Product not found: ${response.status}`);
    }
    
    return await response.json();
}

export async function createOrder(orderData) {
    const response = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    
    return await response.json();
}

export async function submitEstimate(estimateData) {
    const response = await fetch(`${API_BASE}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estimateData)
    });
    
    return await response.json();
}
