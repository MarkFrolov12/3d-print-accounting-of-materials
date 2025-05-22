// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Общая логика для всех страниц
    if (document.getElementById('recent-orders-list')) {
        loadRecentOrders();
    }
});

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    // Фильтруем только проданные или отмененные заказы
    const recentOrders = orders
        .filter(order => order.status === 'sold' || order.status === 'canceled')
        .slice(0, 5) // Берем последние 5
        .reverse(); // Новые сверху
    
    const container = document.getElementById('recent-orders-list');
    
    container.innerHTML = recentOrders.map(order => `
        <div class="order-item">
            <span class="order-product">${order.productName}</span>
            <span class="order-customer">${order.customer}</span>
            <span class="status status-${order.status}">${getStatusText(order.status)}</span>
            <span class="order-date">${formatDate(order.date)}</span>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function getStatusText(status) {
    const statuses = {
        'working': 'В работе',
        'ready': 'Готов',
        'sold': 'Продано',
        'canceled': 'Отменено'
    };
    return statuses[status] || status;
}