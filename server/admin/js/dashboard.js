var API = '/api';
var token = localStorage.getItem('adminToken');

// Check auth
if (!token) {
    window.location.href = '/admin/login.html';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
});

// Load dashboard stats
async function loadDashboard() {
    try {
        // Fetch doctors count
        var docRes = await fetch(API + '/doctors');
        var doctors = await docRes.json();
        document.getElementById('stat-doctors').textContent = doctors.length;

        // Fetch appointments
        var aptRes = await fetch(API + '/appointments', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var appointments = await aptRes.json();

        document.getElementById('stat-appointments').textContent = appointments.length;
        document.getElementById('stat-pending').textContent = appointments.filter(function (a) { return a.status === 'scheduled'; }).length;
        document.getElementById('stat-completed').textContent = appointments.filter(function (a) { return a.status === 'completed'; }).length;

        // Render recent appointments (last 5)
        var recent = appointments.slice(0, 5);
        var container = document.getElementById('recent-appointments');

        if (recent.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-calendar"></i><p>No appointments yet</p></div>';
            return;
        }

        var statusBadge = {
            scheduled: 'badge-yellow',
            completed: 'badge-green',
            cancelled: 'badge-red'
        };

        var html = '<table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead><tbody>';
        recent.forEach(function (apt) {
            var docName = apt.doctor ? apt.doctor.name : 'N/A';
            html += '<tr>' +
                '<td>' + apt.patientName + '</td>' +
                '<td>' + docName + '</td>' +
                '<td>' + apt.date + '</td>' +
                '<td><span class="badge ' + (statusBadge[apt.status] || '') + '">' + apt.status + '</span></td>' +
                '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

loadDashboard();