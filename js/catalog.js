document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadMaterialOptions();
    
    document.getElementById('add-product').addEventListener('click', showAddProductModal);
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    document.querySelector('#product-modal .close').addEventListener('click', closeProductModal);
});

let products = JSON.parse(localStorage.getItem('products')) || [];
let currentProductId = null;

function loadProducts() {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const tbody = document.querySelector('#products-table tbody');
    
    tbody.innerHTML = products.map(product => {
        const material = materials.find(m => m.id === product.materialId);
        const materialName = material ? material.name : 'Неизвестно';
        const cost = calculateProductCost(product.weight, product.materialId);
        
        return `
            <tr data-id="${product.id}">
                <td>${product.name}</td>
                <td>${product.weight} г</td>
                <td>${cost} ₽</td>
                <td>${product.price} ₽</td>
                <td>${materialName}</td>
                <td>
                    <button class="btn-edit" onclick="editProduct(${product.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function calculateProductCost(weight, materialId) {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const material = materials.find(m => m.id === materialId);
    if (!material) return 0;
    
    return (weight * material.pricePerKg / 1000).toFixed(2);
}

function loadMaterialOptions() {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const select = document.getElementById('product-material');
    
    select.innerHTML = materials.map(material => `
        <option value="${material.id}">${material.name} (${material.pricePerKg} ₽/кг)</option>
    `).join('');
}

function showAddProductModal() {
    currentProductId = null;
    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-weight').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-modal-title').textContent = 'Добавить изделие';
    document.getElementById('product-modal').style.display = 'block';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    currentProductId = id;
    document.getElementById('product-id').value = id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-weight').value = product.weight;
    document.getElementById('product-price').value = product.price;
    
    const materialSelect = document.getElementById('product-material');
    materialSelect.value = product.materialId;
    
    document.getElementById('product-modal-title').textContent = 'Редактировать изделие';
    document.getElementById('product-modal').style.display = 'block';
}

function saveProduct(e) {
    e.preventDefault();
    
    const id = currentProductId || Date.now();
    const name = document.getElementById('product-name').value;
    const weight = parseInt(document.getElementById('product-weight').value);
    const materialId = parseInt(document.getElementById('product-material').value);
    const price = parseFloat(document.getElementById('product-price').value);
    
    const product = { id, name, weight, materialId, price };
    
    if (currentProductId) {
        // Обновление существующего продукта
        const index = products.findIndex(p => p.id === currentProductId);
        products[index] = product;
    } else {
        // Добавление нового продукта
        products.push(product);
    }
    
    saveProducts();
    closeProductModal();
}

function deleteProduct(id) {
    if (confirm('Удалить это изделие?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Глобальные функции для использования в HTML
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;