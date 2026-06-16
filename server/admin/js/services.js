var API = 'http://localhost:5000/api';
var token = localStorage.getItem('adminToken');
var deleteId = null;

if (!token) { window.location.href = '/admin/login.html'; }

document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
});

function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
}

// Icon preview
document.getElementById('f-icon').addEventListener('input', function () {
    var val = this.value.trim() || 'fa-solid fa-stethoscope';
    document.getElementById('icon-preview').innerHTML = '<i class="' + val + '"></i>';
});

// Load services
async function loadServices() {
    try {
        var res = await fetch(API + '/services');
        var services = await res.json();
        document.getElementById('service-count').textContent = services.length;
        renderTable(services);
    } catch (error) {
        document.getElementById('services-table-wrapper').innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>Failed to load services</p></div>';
    }
}

function renderTable(services) {
    if (services.length === 0) {
        document.getElementById('services-table-wrapper').innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-list-check"></i><p>No services added yet</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Icon</th><th>Service</th><th>Features</th><th>Featured</th><th>Actions</th></tr></thead><tbody>';
    services.forEach(function (svc) {
        html += '<tr>' +
            '<td><div style="width:40px;height:40px;border-radius:8px;background:#E3F2FD;color:#0F4C81;display:flex;align-items:center;justify-content:center;font-size:16px;"><i class="' + (svc.icon || 'fa-solid fa-stethoscope') + '"></i></div></td>' +
            '<td><strong>' + svc.name + '</strong><br><small style="color:#727780;max-width:300px;display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (svc.description || '') + '</small></td>' +
            '<td><span style="font-size:13px;color:#42474F;">' + (svc.features ? svc.features.length : 0) + ' features</span></td>' +
            '<td>' + (svc.featured ? '<span class="badge badge-green">Yes</span>' : '<span class="badge" style="background:#F0F0F0;color:#727780;">No</span>') + '</td>' +
            '<td><div class="actions-cell">' +
                '<button class="action-btn edit-btn" data-id="' + svc._id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button class="action-btn delete delete-btn" data-id="' + svc._id + '" data-name="' + svc.name + '" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
            '</div></td>' +
            '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('services-table-wrapper').innerHTML = html;

    document.querySelectorAll('.edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { openEditModal(this.getAttribute('data-id')); });
    });
    document.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            deleteId = this.getAttribute('data-id');
            document.getElementById('delete-service-name').textContent = this.getAttribute('data-name');
            document.getElementById('delete-modal').classList.add('open');
        });
    });
}

// Modal helpers
function openModal() { document.getElementById('service-modal').classList.add('open'); }
function closeModal() {
    document.getElementById('service-modal').classList.remove('open');
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    document.getElementById('modal-title').textContent = 'Add Service';
    document.getElementById('icon-preview').innerHTML = '<i class="fa-solid fa-stethoscope"></i>';
}

document.getElementById('add-service-btn').addEventListener('click', function () { closeModal(); openModal(); });
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);

// Edit modal
async function openEditModal(id) {
    try {
        var res = await fetch(API + '/services/' + id);
        var svc = await res.json();
        document.getElementById('service-id').value = svc._id;
        document.getElementById('f-name').value = svc.name;
        document.getElementById('f-icon').value = svc.icon || '';
        document.getElementById('f-description').value = svc.description || '';
        document.getElementById('f-features').value = (svc.features || []).join(', ');
        document.getElementById('f-featured').value = svc.featured ? 'true' : 'false';
        document.getElementById('icon-preview').innerHTML = '<i class="' + (svc.icon || 'fa-solid fa-stethoscope') + '"></i>';
        document.getElementById('modal-title').textContent = 'Edit Service';
        openModal();
    } catch (error) {
        showToast('Failed to load service', 'error');
    }
}

// Submit
document.getElementById('service-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var id = document.getElementById('service-id').value;

    var body = {
        name: document.getElementById('f-name').value,
        icon: document.getElementById('f-icon').value,
        description: document.getElementById('f-description').value,
        features: document.getElementById('f-features').value,
        featured: document.getElementById('f-featured').value
    };

    var url = id ? API + '/services/' + id : API + '/services';
    var method = id ? 'PUT' : 'POST';

    try {
        var res = await fetch(url, {
            method: method,
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showToast(data.message, 'success');
        closeModal();
        loadServices();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Delete
document.getElementById('delete-confirm-btn').addEventListener('click', async function () {
    if (!deleteId) return;
    try {
        var res = await fetch(API + '/services/' + deleteId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showToast(data.message, 'success');
        document.getElementById('delete-modal').classList.remove('open');
        deleteId = null;
        loadServices();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

document.getElementById('delete-modal-close').addEventListener('click', function () {
    document.getElementById('delete-modal').classList.remove('open');
    deleteId = null;
});
document.getElementById('delete-cancel-btn').addEventListener('click', function () {
    document.getElementById('delete-modal').classList.remove('open');
    deleteId = null;
});

loadServices();