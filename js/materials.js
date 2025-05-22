document.addEventListener('DOMContentLoaded', function() {
    loadMaterials();
    
    document.getElementById('add-material').addEventListener('click', showAddMaterialModal);
    document.getElementById('edit-material-form').addEventListener('submit', saveMaterial);
    document.querySelector('.close').addEventListener('click', closeModal);
});

let materials = JSON.parse(localStorage.getItem('materials')) || [];
let currentMaterialId = null;

function loadMaterials() {
    const tbody = document.querySelector('#materials-table tbody');
    tbody.innerHTML = materials.map(material => `
        <tr data-id="${material.id}">
            <td>${material.name}</td>
            <td>${material.pricePerKg} ₽/кг</td>
            <td>${material.remaining} г</td>
            <td>
                <button class="btn-edit" onclick="editMaterial(${material.id})">✏️</button>
                <button class="btn-delete" onclick="deleteMaterial(${material.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showAddMaterialModal() {
    currentMaterialId = null;
    document.getElementById('edit-material-id').value = '';
    document.getElementById('edit-material-name').value = '';
    document.getElementById('edit-material-price').value = '';
    document.getElementById('edit-material-remaining').value = '';
    document.getElementById('edit-modal').style.display = 'block';
}

function editMaterial(id) {
    const material = materials.find(m => m.id === id);
    if (!material) return;
    
    currentMaterialId = id;
    document.getElementById('edit-material-id').value = id;
    document.getElementById('edit-material-name').value = material.name;
    document.getElementById('edit-material-price').value = material.pricePerKg;
    document.getElementById('edit-material-remaining').value = material.remaining;
    document.getElementById('edit-modal').style.display = 'block';
}

function saveMaterial(e) {
    e.preventDefault();
    
    const id = currentMaterialId || Date.now();
    const name = document.getElementById('edit-material-name').value;
    const pricePerKg = parseFloat(document.getElementById('edit-material-price').value);
    const remaining = parseInt(document.getElementById('edit-material-remaining').value);
    
    const material = { id, name, pricePerKg, remaining };
    
    if (currentMaterialId) {
        // Обновление существующего материала
        const index = materials.findIndex(m => m.id === currentMaterialId);
        materials[index] = material;
    } else {
        // Добавление нового материала
        materials.push(material);
    }
    
    saveMaterials();
    closeModal();
}

function deleteMaterial(id) {
    if (confirm('Удалить этот материал?')) {
        materials = materials.filter(m => m.id !== id);
        saveMaterials();
    }
}

function saveMaterials() {
    localStorage.setItem('materials', JSON.stringify(materials));
    loadMaterials();
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Глобальные функции для использования в HTML
window.editMaterial = editMaterial;
window.deleteMaterial = deleteMaterial;