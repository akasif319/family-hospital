var API = '/api';
var token = localStorage.getItem('adminToken');
var deleteId = null;

// Check auth
if (!token) {
    window.location.href = '/admin/login.html';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
});

// Toast notification
function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
}

// Parse schedule from form inputs to object
function getScheduleFromForm() {
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var schedule = {};
    days.forEach(function (day) {
        var val = document.getElementById('s-' + day).value.trim();
        if (val) {
            schedule[day] = val.split(',').map(function (t) { return t.trim(); }).filter(function (t) { return t; });
        }
    });
    return schedule;
}

// Fill schedule inputs from object
function fillScheduleInputs(schedule) {
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    days.forEach(function (day) {
        var el = document.getElementById('s-' + day);
        el.value = (schedule && schedule.get) ? (schedule.get(day) || []).join(', ') :
                   (schedule && schedule[day]) ? schedule[day].join(', ') : '';
    });
}

// Load all doctors
async function loadDoctors() {
    try {
        var res = await fetch(API + '/doctors');
        var doctors = await res.json();
        document.getElementById('doctor-count').textContent = doctors.length;
        renderDoctorsTable(doctors);
    } catch (error) {
        document.getElementById('doctors-table-wrapper').innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>Failed to load doctors</p></div>';
    }
}

function renderDoctorsTable(doctors) {
    if (doctors.length === 0) {
        document.getElementById('doctors-table-wrapper').innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-user-doctor"></i><p>No doctors added yet</p></div>';
        return;
    }

    var deptColors = {
        'Cardiology': 'badge-blue', 'Neurology': 'badge-teal', 'Orthopedics': 'badge-blue',
        'Pediatric': 'badge-teal', 'General Medicine': 'badge-yellow', 'Emergency': 'badge-red',
        'Pulmonology': 'badge-blue', 'Ophthalmology': 'badge-teal'
    };

    var html = '<table><thead><tr><th>Doctor</th><th>Department</th><th>Rating</th><th>Featured</th><th>Actions</th></tr></thead><tbody>';
    doctors.forEach(function (doc) {
        var imgHtml = doc.image
            ? '<img src="' + doc.image + '" alt="' + doc.name + '" onerror="this.outerHTML=\'<div class=\\\'doctor-cell-placeholder\\\'><i class=\\\'fa-solid fa-user-doctor\\\'></i></div>\';">'
            : '<div class="doctor-cell-placeholder"><i class="fa-solid fa-user-doctor"></i></div>';

        html += '<tr>' +
            '<td><div class="doctor-cell">' + imgHtml + '<div><strong>' + doc.name + '</strong><br><small style="color:#727780;">' + (doc.title || doc.qualification || '') + '</small></div></div></td>' +
            '<td><span class="badge ' + (deptColors[doc.department] || 'badge-blue') + '">' + doc.department + '</span></td>' +
            '<td><i class="fa-solid fa-star" style="color:#F5A623;font-size:12px;"></i> ' + doc.rating + '</td>' +
            '<td>' + (doc.featured ? '<span class="badge badge-green">Yes</span>' : '<span class="badge" style="background:#F0F0F0;color:#727780;">No</span>') + '</td>' +
            '<td><div class="actions-cell">' +
                '<button class="action-btn edit-btn" data-id="' + doc._id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
                '<button class="action-btn delete delete-btn" data-id="' + doc._id + '" data-name="' + doc.name + '" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
            '</div></td>' +
            '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('doctors-table-wrapper').innerHTML = html;

    // Attach edit buttons
    document.querySelectorAll('.edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { openEditModal(this.getAttribute('data-id')); });
    });

    // Attach delete buttons
    document.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            deleteId = this.getAttribute('data-id');
            document.getElementById('delete-doctor-name').textContent = this.getAttribute('data-name');
            document.getElementById('delete-modal').classList.add('open');
        });
    });
}

// Modal helpers
function openModal() { document.getElementById('doctor-modal').classList.add('open'); }
function closeModal() {
    document.getElementById('doctor-modal').classList.remove('open');
    document.getElementById('doctor-form').reset();
    document.getElementById('doctor-id').value = '';
    document.getElementById('f-existing-image').value = '';
    document.getElementById('file-name-display').textContent = '';
    document.getElementById('modal-title').textContent = 'Add Doctor';
    fillScheduleInputs({});
}

document.getElementById('add-doctor-btn').addEventListener('click', function () { closeModal(); openModal(); });
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);

// File name display
document.getElementById('f-image').addEventListener('change', function () {
    document.getElementById('file-name-display').textContent = this.files[0] ? this.files[0].name : '';
});

// Open edit modal with doctor data
async function openEditModal(id) {
    try {
        var res = await fetch(API + '/doctors/' + id);
        var doc = await res.json();

        document.getElementById('doctor-id').value = doc._id;
        document.getElementById('f-name').value = doc.name;
        document.getElementById('f-department').value = doc.department;
        document.getElementById('f-title').value = doc.title || '';
        document.getElementById('f-gender').value = doc.gender || 'male';
        document.getElementById('f-experience').value = doc.experience || '';
        document.getElementById('f-qualification').value = doc.qualification || '';
        document.getElementById('f-rating').value = doc.rating || 0;
        document.getElementById('f-reviews').value = doc.reviews || 0;
        document.getElementById('f-location').value = doc.location || '';
        document.getElementById('f-tags').value = (doc.tags || []).join(', ');
        document.getElementById('f-description').value = doc.description || '';
        document.getElementById('f-featured').value = doc.featured ? 'true' : 'false';
        document.getElementById('f-existing-image').value = doc.image || '';
        fillScheduleInputs(doc.schedule);

        if (doc.image) {
            document.getElementById('file-name-display').textContent = 'Current: ' + doc.image;
        }

        document.getElementById('modal-title').textContent = 'Edit Doctor';
        openModal();
    } catch (error) {
        showToast('Failed to load doctor data', 'error');
    }
}

// Submit form (add or update)
document.getElementById('doctor-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    var id = document.getElementById('doctor-id').value;
    var formData = new FormData();
    formData.append('name', document.getElementById('f-name').value);
    formData.append('department', document.getElementById('f-department').value);
    formData.append('title', document.getElementById('f-title').value);
    formData.append('gender', document.getElementById('f-gender').value);
    formData.append('experience', document.getElementById('f-experience').value);
    formData.append('qualification', document.getElementById('f-qualification').value);
    formData.append('rating', document.getElementById('f-rating').value);
    formData.append('reviews', document.getElementById('f-reviews').value);
    formData.append('location', document.getElementById('f-location').value);
    formData.append('tags', document.getElementById('f-tags').value);
    formData.append('description', document.getElementById('f-description').value);
    formData.append('featured', document.getElementById('f-featured').value);
    formData.append('schedule', JSON.stringify(getScheduleFromForm()));

            // Add image only if a file is actually selected
if (document.getElementById('f-image').files[0]) {
    formData.append('image', document.getElementById('f-image').files[0]);
} 
// If no new file is selected, DO NOT append 'image' to formData at all.
// The backend controller should handle keeping the existing image.

    var url = id ? API + '/doctors/' + id : API + '/doctors';
    var method = id ? 'PUT' : 'POST';

    try {
        var res = await fetch(url, {
            method: method,
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });

        var data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed');

        showToast(data.message, 'success');
        closeModal();
        loadDoctors();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Delete doctor
document.getElementById('delete-confirm-btn').addEventListener('click', async function () {
    if (!deleteId) return;
    try {
        var res = await fetch(API + '/doctors/' + deleteId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showToast(data.message, 'success');
        document.getElementById('delete-modal').classList.remove('open');
        deleteId = null;
        loadDoctors();
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

// Fix image picker click
document.getElementById('file-wrapper').addEventListener('click', function () {
    document.getElementById('f-image').click();
});

// Initial load
loadDoctors();