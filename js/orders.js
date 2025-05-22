document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Загрузка начальных данных
    loadOrders();
    loadProductOptions();
    
    // Назначение обработчиков событий
    document.getElementById('add-order').addEventListener('click', showAddOrderModal);
    document.getElementById('order-form').addEventListener('submit', saveOrder);
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.querySelector('#order-modal .close').addEventListener('click', closeOrderModal);
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('order-modal');
        if (event.target === modal) {
            closeOrderModal();
        }
    });
});

let orders = [];
let currentOrderId = null;

function loadOrders(filter = 'all') {
    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(order => order.status === filter);
    
    const tbody = document.querySelector('#orders-table tbody');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    tbody.innerHTML = filteredOrders.map(order => {
        const product = products.find(p => p.id === order.productId);
        const productName = product ? product.name : 'Неизвестно';
        const productWeight = product ? product.weight + ' г' : '—';
        const productPrice = product ? product.price + ' ₽' : '—';
        
        return `
            <tr data-id="${order.id}">
                <td>${formatDate(order.date)}</td>
                <td>${productName}</td>
                <td>${productWeight}</td>
                <td>${productPrice}</td>
                <td>${order.customer}</td>
                <td><span class="status status-${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn-edit" onclick="editOrder(${order.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteOrder(${order.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function getStatusText(status) {
    const statusMap = {
        'working': 'В работе',
        'ready': 'Готов',
        'sold': 'Продано',
        'canceled': 'Отменено'
    };
    return statusMap[status] || status;
}

function loadProductOptions() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const select = document.getElementById('order-product');
    
    select.innerHTML = '<option value="">Выберите изделие</option>' + 
        products.map(product => `
            <option value="${product.id}">
                ${product.name} (${product.weight}г, ${product.price}₽)
            </option>
        `).join('');
}

function showAddOrderModal() {
    currentOrderId = null;
    document.getElementById('order-form').reset();
    document.getElementById('order-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('order-modal-title').textContent = 'Новый заказ';
    document.getElementById('order-modal').style.display = 'block';
    
    // Убедимся, что список продуктов актуален
    loadProductOptions();
}

function editOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    currentOrderId = id;
    document.getElementById('order-id').value = id;
    document.getElementById('order-product').value = order.productId;
    document.getElementById('order-customer').value = order.customer;
    document.getElementById('order-status').value = order.status;
    document.getElementById('order-date').value = order.date.split('T')[0];
    
    document.getElementById('order-modal-title').textContent = 'Редактировать заказ';
    document.getElementById('order-modal').style.display = 'block';
}




function saveOrder(e) {
    e.preventDefault();
    
    // Получаем элемент выбора изделия
    const productSelect = document.getElementById('order-product');
    if (!productSelect) {
        alert('Ошибка: элемент выбора изделия не найден');
        return;
    }
    
    // Получаем значение выбранного изделия
    const productId = parseInt(productSelect.value);
    
    // Валидация productId
    if (isNaN(productId) || productSelect.selectedIndex === -1) {
        alert('Пожалуйста, выберите изделие');
        return;
    }
    
    const customer = document.getElementById('order-customer').value.trim();
    const status = document.getElementById('order-status').value;
    const date = document.getElementById('order-date').value || new Date().toISOString().split('T')[0];
    
    // Валидация заказчика
    if (!customer) {
        alert('Пожалуйста, укажите заказчика');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Ошибка: изделие не найдено');
        return;
    }
    
    const productName = product.name;
    const productWeight = product.weight;
    const materialId = product.materialId;
    
    const orderData = {
        id: currentOrderId || Date.now(),
        productId,
        productName,
        productWeight,
        materialId,
        customer,
        status,
        date
    };
    
    // Получаем текущий заказ для проверки изменения статуса
    const existingOrder = currentOrderId ? orders.find(o => o.id === currentOrderId) : null;
    const wasSold = existingOrder && existingOrder.status === 'sold';
    const nowSold = status === 'sold';
    
    if (currentOrderId) {
        // Обновление существующего заказа
        const index = orders.findIndex(o => o.id === currentOrderId);
        
        // Если статус изменился на "Продано" или с "Продано"
        if (wasSold !== nowSold) {
            updateMaterialWeight(materialId, productWeight, nowSold ? 'subtract' : 'add');
        }
        
        orders[index] = orderData;
    } else {
        // Добавление нового заказа
        if (nowSold) {
            updateMaterialWeight(materialId, productWeight, 'subtract');
        }
        orders.push(orderData);
    }
    
    saveOrders();
    closeOrderModal();
}






// Новая функция для обновления веса материала
function updateMaterialWeight(materialId, weight, operation) {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const materialIndex = materials.findIndex(m => m.id === materialId);
    
    if (materialIndex === -1) {
        console.error('Материал не найден');
        return;
    }
    
    if (operation === 'subtract') {
        materials[materialIndex].remaining -= weight;
        if (materials[materialIndex].remaining < 0) {
            materials[materialIndex].remaining = 0;
            alert('Внимание! Остаток материала достиг нуля!');
        }
    } else if (operation === 'add') {
        materials[materialIndex].remaining += weight;
    }
    
    localStorage.setItem('materials', JSON.stringify(materials));
    
    // Обновляем отображение материалов, если открыта страница материалов
    if (typeof loadMaterials === 'function') {
        loadMaterials();
    }
}

// Обновляем функцию deleteOrder() для возврата веса при удалении проданного заказа
function deleteOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        // Если заказ был продан, возвращаем вес материала
        if (order.status === 'sold' && order.materialId && order.productWeight) {
            updateMaterialWeight(order.materialId, order.productWeight, 'add');
        }
        
        orders = orders.filter(o => o.id !== id);
        saveOrders();
    }
}

function deleteOrder(id) {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        orders = orders.filter(o => o.id !== id);
        saveOrders();
    }
}

function filterOrders() {
    const filter = document.getElementById('status-filter').value;
    loadOrders(filter);
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders(document.getElementById('status-filter').value);
    
    // Обновляем сводку на главной странице
    if (typeof updateFinanceSummary === 'function') {
        updateFinanceSummary();
    }
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Глобальные функции для использования в HTML
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;