function fetchJSON(path) {
    return fetch(path, {credentials: 'omit'}).then(function(resp) {
        if (!resp.ok) throw new Error('Failed to load ' + path);
        return resp.text();
    }).then(function(text) {
        return JSON.parse(text);
    });
}

function initScrollSpy() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = entry.target.getAttribute('id');
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px' });

    sections.forEach(function(sec) { observer.observe(sec); });
}

function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var overlay = document.querySelector('.mobile-overlay');
    var closeBtn = document.querySelector('.mobile-close');
    var overlayLinks = overlay ? overlay.querySelectorAll('a') : [];

    if (toggle && overlay) {
        toggle.addEventListener('click', function() {
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', function() {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
    overlayLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

function initCVButton(siteData) {
    var cv = siteData.cv;
    if (!cv || !cv.enabled) {
        document.querySelectorAll('.cv-btn').forEach(function(el) { el.style.display = 'none'; });
        return;
    }
    var buttons = document.querySelectorAll('.cv-btn');
    buttons.forEach(function(btn) {
        btn.style.display = '';
        var mode = cv.mode || 'view';
        var label = cv.labels && cv.labels[mode] ? cv.labels[mode] : 'CV';
        btn.textContent = label;
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (mode === 'view' && cv.viewer) {
                window.open(cv.viewer + '?url=' + encodeURIComponent('../' + cv.path), '_blank');
            } else if (mode === 'download') {
                var a = document.createElement('a');
                a.href = cv.path;
                a.download = 'cv.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else if (mode === 'external' && cv.external_url) {
                window.open(cv.external_url, '_blank');
            }
        });
    });
}

function initContactForm(emailjsConfig) {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        if (!emailjsConfig || !emailjsConfig.service_id || !emailjsConfig.template_id) {
            btn.textContent = '\u2713 Sent (offline)';
            setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2000);
            form.reset();
            return;
        }
        if (typeof emailjs === 'undefined') {
            btn.textContent = '\u2717 Service unavailable';
            setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2000);
            return;
        }
        var templateParams = {
            from_name: form.from_name.value,
            from_email: form.from_email.value,
            subject: form.subject ? form.subject.value : '',
            message: form.message.value
        };
        emailjs.send(emailjsConfig.service_id, emailjsConfig.template_id, templateParams, emailjsConfig.public_key)
            .then(function() {
                btn.textContent = '\u2713 Sent!';
                form.reset();
            }, function() {
                btn.textContent = '\u2717 Failed';
            })
            .finally(function() {
                setTimeout(function() { btn.textContent = originalText; btn.disabled = false; }, 2500);
            });
    });
}
