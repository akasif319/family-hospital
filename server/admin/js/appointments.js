var API = '/api';
var token = localStorage.getItem('adminToken');
var allAppointments = [];

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

// Status badge class
function statusBadge(status) {
    var map = { scheduled: 'badge-yellow', completed: 'badge-green', cancelled: 'badge-red' };
    return '<span class="badge ' + (map[status] || '') + '">' + status + '</span>';
}

// Load appointments
// Load appointments
async function loadAppointments(filter) {
    var url = API + '/appointments';
    if (filter && filter !== 'all') url += '?status=' + filter;

    var wrapper = document.getElementById('appointments-table-wrapper');
    wrapper.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>';

    try {
        var res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
        
        // THIS IS THE MISSING CHECK — before it blindly treated errors as valid data
        if (!res.ok) {
            var errData = await res.json().catch(function() { return {}; });
            throw new Error(errData.message || 'Server returned ' + res.status);
        }
        
        allAppointments = await res.json();
        renderStats(allAppointments);
        renderTable(allAppointments);
    } catch (error) {
        console.error('APPOINTMENTS LOAD ERROR:', error);
        wrapper.innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i>' +
            '<p>Failed to load: ' + error.message + '</p></div>';
    }
}

function renderStats(list) {
    document.getElementById('stat-total').textContent = list.length;
    document.getElementById('stat-scheduled').textContent = list.filter(function (a) { return a.status === 'scheduled'; }).length;
    document.getElementById('stat-completed').textContent = list.filter(function (a) { return a.status === 'completed'; }).length;
    document.getElementById('stat-cancelled').textContent = list.filter(function (a) { return a.status === 'cancelled'; }).length;
}

function renderTable(list) {
    document.getElementById('apt-count').textContent = list.length;

    if (list.length === 0) {
        document.getElementById('appointments-table-wrapper').innerHTML =
            '<div class="empty-state"><i class="fa-regular fa-calendar"></i><p>No appointments found</p></div>';
        return;
    }

    var html = '<table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Ref</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    list.forEach(function (apt) {
        var docName = apt.doctor ? apt.doctor.name : 'N/A';
        html += '<tr>' +
            '<td><strong>' + apt.patientName + '</strong><br><small style="color:#727780;">' + apt.patientPhone + '</small></td>' +
            '<td>' + docName + '</td>' +
            '<td>' + apt.date + '</td>' +
            '<td>' + apt.time + '</td>' +
            '<td><small style="color:#727780;">' + apt.reference + '</small></td>' +
            '<td>' + statusBadge(apt.status) + '</td>' +
            '<td><div class="actions-cell">' +
                '<button class="action-btn view-btn" data-id="' + apt._id + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
                '<button class="action-btn status-btn" data-id="' + apt._id + '" data-status="completed" title="Complete" style="color:#2E7D32;"><i class="fa-solid fa-check"></i></button>' +
                '<button class="action-btn delete status-btn" data-id="' + apt._id + '" data-status="cancelled" title="Cancel"><i class="fa-solid fa-xmark"></i></button>' +
            '</div></td>' +
            '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('appointments-table-wrapper').innerHTML = html;

    // View buttons
    document.querySelectorAll('.view-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { showDetail(this.getAttribute('data-id')); });
    });

    // Status buttons
    document.querySelectorAll('.status-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { changeStatus(this.getAttribute('data-id'), this.getAttribute('data-status')); });
    });
}

// Change status
async function changeStatus(id, status) {
    try {
        var res = await fetch(API + '/appointments/' + id + '/status', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showToast('Appointment ' + status, 'success');
        loadAppointments(document.getElementById('status-filter').value);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// View detail
function showDetail(id) {
    var apt = allAppointments.find(function (a) { return a._id === id; });
    if (!apt) return;

    var docName = apt.doctor ? apt.doctor.name + ' (' + apt.doctor.department + ')' : 'N/A';
    var html =
        '<div style="display:grid;gap:14px;">' +
            detailRow('Reference', apt.reference) +
            detailRow('Status', statusBadge(apt.status)) +
            detailRow('Patient', apt.patientName) +
            detailRow('Phone', apt.patientPhone) +
            detailRow('Email', apt.patientEmail) +
            (apt.patientDOB ? detailRow('Date of Birth', apt.patientDOB) : '') +
            (apt.patientGender ? detailRow('Gender', apt.patientGender) : '') +
            (apt.patientBloodGroup ? detailRow('Blood Group', apt.patientBloodGroup) : '') +
            detailRow('Doctor', docName) +
            detailRow('Date', apt.date) +
            detailRow('Time', apt.time) +
            (apt.reason ? detailRow('Reason', apt.reason) : '') +
            (apt.insuranceProvider ? detailRow('Insurance', apt.insuranceProvider + (apt.insurancePolicy ? ' (' + apt.insurancePolicy + ')' : '')) : '') +
            detailRow('Booked On', new Date(apt.createdAt).toLocaleString()) +
        '</div>';

    document.getElementById('detail-body').innerHTML = html;
    document.getElementById('detail-modal').classList.add('open');
}

function detailRow(label, value) {
    return '<div style="display:flex;gap:12px;"><span style="width:120px;flex-shrink:0;font-size:13px;color:#727780;font-weight:500;">' + label + '</span><span style="font-size:14px;color:#071E27;">' + value + '</span></div>';
}

// Close detail modal
document.getElementById('detail-modal-close').addEventListener('click', function () {
    document.getElementById('detail-modal').classList.remove('open');
});
document.getElementById('detail-close-btn').addEventListener('click', function () {
    document.getElementById('detail-modal').classList.remove('open');
});

// Filter
document.getElementById('status-filter').addEventListener('change', function () {
    loadAppointments(this.value);
});

// Initial load
loadAppointments('all');