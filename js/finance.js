document.addEventListener('DOMContentLoaded', function() {
    updateFinanceSummary();
});

function updateFinanceSummary() {
    const summary = getFinanceSummary();
    
    if (document.getElementById('total-earned')) {
        document.getElementById('total-earned').textContent = summary.earned + ' ₽';
        document.getElementById('total-spent').textContent = summary.spent + ' ₽';
        document.getElementById('total-profit').textContent = summary.profit + ' ₽';
    }
}

function getFinanceSummary() {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Рассчитываем общие расходы на материалы
    let totalSpent = 0;
    materials.forEach(material => {
        // Предполагаем, что изначально было 1000 г каждого материала
        const used = 1000 - material.remaining;
        totalSpent += used * material.pricePerKg / 1000;
    });
    
    // Рассчитываем общий доход от проданных заказов
    const totalEarned = orders
        .filter(order => order.status === 'sold')
        .reduce((sum, order) => {
            const product = products.find(p => p.id === order.productId);
            return sum + (product ? product.price : 0);
        }, 0);
    
    return {
        spent: totalSpent.toFixed(2),
        earned: totalEarned.toFixed(2),
        profit: (totalEarned - totalSpent).toFixed(2)
    };
}

// Обновляем сводку при изменении данных
window.addEventListener('storage', function() {
    updateFinanceSummary();
});