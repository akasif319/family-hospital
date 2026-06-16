const API = '/api';

document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('login-error');
    errorEl.classList.remove('visible');

    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;

    try {
        var res = await fetch(API + '/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        var data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Login failed';
            errorEl.classList.add('visible');
            return;
        }

        // Save token
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin/dashboard.html';
    } catch (error) {
        errorEl.textContent = 'Connection error. Is the server running?';
        errorEl.classList.add('visible');
    }
});

// If already logged in, redirect to dashboard
if (localStorage.getItem('adminToken')) {
    window.location.href = '/admin/dashboard.html';
}