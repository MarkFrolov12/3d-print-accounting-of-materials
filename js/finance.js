document.addEventListener('DOMContentLoaded', function() {
    updateFinanceSummary();
});

function updateFinanceSummary() {
    const summary = getFinanceSummary();
    
    if (document.getElementById('total-earned')) {
        document.getElementById('total-earned').textContent = formatMoney(summary.earned) + ' ₽';
        document.getElementById('total-spent').textContent = formatMoney(summary.spent) + ' ₽';
        document.getElementById('total-profit').textContent = formatMoney(summary.profit) + ' ₽';
    }
}

// Форматирование денежной суммы (с пробелами между разрядами)
function formatMoney(amount) {
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getFinanceSummary() {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Рассчитываем общие расходы на материалы
    let totalSpent = 0;
    materials.forEach(material => {
        // Если в материале есть поле initialRemaining, используем его, иначе — 1000 г
        const initial = material.initialRemaining !== undefined ? material.initialRemaining : 1000;
        const used = initial - material.remaining;
        totalSpent += used * material.pricePerKg / 1000;
    });
    
    // Рассчитываем общий доход от проданных заказов
    const totalEarned = orders
        .filter(order => order.status === 'sold' && order.productId)
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

// Обновляем сводку при изменении данных (в том числе локальных)
// Например, после добавления/изменения заказа, материала или продукта
// Для этого вызывайте updateFinanceSummary() после каждого изменения

// Обновляем сводку при изменении localStorage в другой вкладке
window.addEventListener('storage', updateFinanceSummary);
