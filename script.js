// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('active');
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-xmark');
});

document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        navToggle.querySelector('i').classList.add('fa-bars');
        navToggle.querySelector('i').classList.remove('fa-xmark');
    });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var currentItem = this.parentElement;
        var answer = this.nextElementSibling;
        var icon = this.querySelector('.faq-icon');
        var isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

        document.querySelectorAll('.faq-answer').forEach(function (a) {
            a.style.maxHeight = null;
        });
        document.querySelectorAll('.faq-icon').forEach(function (i) {
            i.style.transform = null;
        });

        if (!isOpen) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        }
    });
});

// Go to top button
var goTopBtn = document.getElementById('go-top-btn');

window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
        goTopBtn.classList.add('visible');
    } else {
        goTopBtn.classList.remove('visible');
    }
});

goTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Chatbot toggle
var chatbotToggle = document.getElementById('chatbot-toggle');
var chatbotPanel = document.getElementById('chatbot-panel');
var chatbotClose = document.getElementById('chatbot-close');

function openChat() {
    chatbotPanel.classList.add('open');
    chatbotToggle.classList.add('active');
}

function closeChat() {
    chatbotPanel.classList.remove('open');
    chatbotToggle.classList.remove('active');
}

chatbotToggle.addEventListener('click', openChat);
chatbotClose.addEventListener('click', closeChat);

// Close chat when clicking outside the panel
document.addEventListener('click', function (e) {
    if (chatbotPanel.classList.contains('open')) {
        var clickedInsidePanel = chatbotPanel.contains(e.target);
        var clickedToggle = chatbotToggle.contains(e.target);
        if (!clickedInsidePanel && !clickedToggle) {
            closeChat();
        }
    }
});

chatbotToggle.addEventListener('click', function () {
    chatbotPanel.classList.add('open');
    chatbotToggle.classList.add('active');
});

chatbotClose.addEventListener('click', function () {
    chatbotPanel.classList.remove('open');
    chatbotToggle.classList.remove('active');
});

// Chatbot send message
var chatForm = document.getElementById('chatbot-form');
var chatInput = document.getElementById('chatbot-input');
var chatMessages = document.getElementById('chatbot-messages');

// Simple auto-reply map — connect to your backend later
var botReplies = {
    appointment: 'You can book an appointment by clicking the "Book Appointment" button or calling +1 (800) 234-5678.',
    hours: 'We are open Monday to Saturday, 8:00 AM to 8:00 PM. Emergency services are available 24/7.',
    insurance: 'We accept most major insurance plans including Blue Cross, Aetna, UnitedHealth, Cigna, and Medicare.',
    emergency: 'For emergencies, please call 911 or visit our ER immediately. We are open 24/7.',
    default: 'Thank you for your message. Our team will get back to you shortly. For urgent queries, please call +1 (800) 234-5678.'
};

function getBotReply(text) {
    var lower = text.toLowerCase();
    if (lower.includes('appointment') || lower.includes('book')) return botReplies.appointment;
    if (lower.includes('hour') || lower.includes('timing') || lower.includes('open')) return botReplies.hours;
    if (lower.includes('insurance') || lower.includes('plan')) return botReplies.insurance;
    if (lower.includes('emergency') || lower.includes('urgent')) return botReplies.emergency;
    return botReplies.default;
}

function addMessage(text, sender) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    div.innerHTML = '<p>' + text + '</p>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // Small delay to feel natural
    setTimeout(function () {
        addMessage(getBotReply(text), 'bot');
    }, 600);
});


// Scroll animations
var animElements = document.querySelectorAll('.anim');
var animObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            var delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(function () {
                entry.target.classList.add('visible');
            }, parseInt(delay));
            animObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

animElements.forEach(function (el) {
    animObserver.observe(el);
});

// Stats counter animation
var statNumbers = document.querySelectorAll('.stat-number');
var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(function (el) {
    statObserver.observe(el);
});

function animateCounter(el) {
    var text = el.textContent;
    var match = text.match(/([\d,]+)(.*)/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''));
    var suffix = match[2];
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target.toLocaleString() + suffix;
        }
    }

    requestAnimationFrame(step);
}

// Navbar shadow on scroll
var navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}

// ===== User Auth Nav State =====
(function() {
    var token = localStorage.getItem('userToken');
    var guestEl = document.getElementById('nav-auth-guest');
    var userEl = document.getElementById('nav-auth-user');
    var nameEl = document.getElementById('nav-user-name');
    var dropdown = document.getElementById('nav-user-dropdown');
    var userBtn = document.getElementById('nav-user-btn');
    var logoutBtn = document.getElementById('nav-user-logout');

    if (token) {
        guestEl.style.display = 'none';
        userEl.style.display = 'block';
        var name = localStorage.getItem('userName');
        nameEl.textContent = name ? name.split(' ')[0] : 'User';
    } else {
        guestEl.style.display = 'block';
        userEl.style.display = 'none';
    }

    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
    }

    document.addEventListener('click', function() {
        if (dropdown) dropdown.classList.remove('open');
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }
})();

// ===== Accessibility Toolbar =====
(function() {
    var panel = document.getElementById('a11y-panel');
    var toggle = document.getElementById('a11y-toggle');
    var closeBtn = document.getElementById('a11y-panel-close');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', function() {
        panel.classList.toggle('open');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            panel.classList.remove('open');
        });
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.a11y-toolbar')) {
            panel.classList.remove('open');
        }
    });

    // Toggle functions
    function a11yToggle(className) {
        document.body.classList.toggle(className);
        saveSettings();
    }

    // Font size
    var fontBtns = document.querySelectorAll('.a11y-font-btn');
    fontBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            fontBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            document.body.classList.remove('a11y-large-text');
            if (this.getAttribute('data-size') === 'large') {
                document.body.classList.add('a11y-large-text');
            }
            saveSettings();
        });
    });

    // Reset
    var resetBtn = document.getElementById('a11y-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.body.classList.remove(
                'a11y-high-contrast',
                'a11y-grayscale',
                'a11y-readable',
                'a11y-no-motion',
                'a11y-link-highlight',
                'a11y-large-text'
            );
            fontBtns.forEach(function(b) { b.classList.remove('active'); });
            var defaultBtn = document.querySelector('.a11y-font-btn[data-size="default"]');
            if (defaultBtn) defaultBtn.classList.add('active');
            document.querySelectorAll('.a11y-switch input').forEach(function(cb) { cb.checked = false; });
            localStorage.removeItem('a11y-settings');
        });
    }

    // Save/Load settings
    function saveSettings() {
        var settings = {
            highContrast: document.body.classList.contains('a11y-high-contrast'),
            grayscale: document.body.classList.contains('a11y-grayscale'),
            readable: document.body.classList.contains('a11y-readable'),
            noMotion: document.body.classList.contains('a11y-no-motion'),
            linkHighlight: document.body.classList.contains('a11y-link-highlight'),
            largeText: document.body.classList.contains('a11y-large-text')
        };
        localStorage.setItem('a11y-settings', JSON.stringify(settings));
    }

    function loadSettings() {
        var saved = localStorage.getItem('a11y-settings');
        if (!saved) return;
        try {
            var s = JSON.parse(saved);
            if (s.highContrast) { document.body.classList.add('a11y-high-contrast'); var cb = document.getElementById('a11y-contrast'); if (cb) cb.checked = true; }
            if (s.grayscale) { document.body.classList.add('a11y-grayscale'); var cb = document.getElementById('a11y-grayscale'); if (cb) cb.checked = true; }
            if (s.readable) { document.body.classList.add('a11y-readable'); var cb = document.getElementById('a11y-readable'); if (cb) cb.checked = true; }
            if (s.noMotion) { document.body.classList.add('a11y-no-motion'); var cb = document.getElementById('a11y-motion'); if (cb) cb.checked = true; }
            if (s.linkHighlight) { document.body.classList.add('a11y-link-highlight'); var cb = document.getElementById('a11y-links'); if (cb) cb.checked = true; }
            if (s.largeText) {
                document.body.classList.add('a11y-large-text');
                fontBtns.forEach(function(b) { b.classList.remove('active'); });
                var largeBtn = document.querySelector('.a11y-font-btn[data-size="large"]');
                if (largeBtn) largeBtn.classList.add('active');
            }
        } catch(e) {}
    }

    // Bind toggle switches
    document.querySelectorAll('.a11y-switch input').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var map = {
                'a11y-contrast': 'a11y-high-contrast',
                'a11y-grayscale': 'a11y-grayscale',
                'a11y-readable': 'a11y-readable',
                'a11y-motion': 'a11y-no-motion',
                'a11y-links': 'a11y-link-highlight'
            };
            var cls = map[this.id];
            if (cls) a11yToggle(cls);
        });
    });

    // Respect system reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('a11y-no-motion');
        var motionCb = document.getElementById('a11y-motion');
        if (motionCb) motionCb.checked = true;
    }

    loadSettings();
})();