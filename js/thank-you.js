/* ═══════════════════════════════════
   PARETO RIGHT HAND — THANK YOU PAGE JS
   ═══════════════════════════════════ */

// Force scroll to top on page load (prevents redirect scroll restoration)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// --- Analytics helper ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

// --- Lenis smooth scroll ---
var lenis = new Lenis({
  duration: 1.2,
  easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
  smoothWheel: true,
});
function lenisRaf(time) {
  lenis.raf(time);
  requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

// --- Scroll reveal ---
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(function (el) {
  revealObserver.observe(el);
});

// --- FAQ accordion ---
document.querySelectorAll('.faq-q').forEach(function (q) {
  q.addEventListener('click', function () {
    var item = q.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
    trackEvent('faq_interaction', { question: q.textContent.trim().substring(0, 80) });
  });
});

// --- Smooth scroll via Lenis ---
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (target) lenis.scrollTo(target);
  });
});

// --- Animated counter for stats ---
var counterObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      var nums = entry.target.querySelectorAll('.stat-number');
      nums.forEach(function (num) {
        if (num.dataset.counted) return;
        num.dataset.counted = 'true';
        var text = num.textContent.trim();
        var match = text.match(/^(\d+)/);
        if (!match) return;
        var target = parseInt(match[1]);
        var suffix = text.replace(/^\d+/, '');
        var current = 0;
        var step = Math.max(1, Math.floor(target / 40));
        var interval = setInterval(function () {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          num.textContent = current + suffix;
        }, 30);
      });
    }
  });
}, { threshold: 0.3 });

var statsGrid = document.querySelector('.stats-grid');
if (statsGrid) counterObserver.observe(statsGrid);

// --- Progress tracker scroll highlighting ---
(function () {
  var step1 = document.getElementById('step-1');
  var step2 = document.getElementById('step-2');
  var step3 = document.getElementById('step-3');
  var questionnaire = document.getElementById('questionnaire');
  var vsl = document.getElementById('vsl');
  if (!step1 || !questionnaire) return;

  var stepObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (entry.target.id === 'vsl') {
          step1.classList.remove('active');
          step1.classList.add('completed');
          step2.classList.add('active');
        }
      }
    });
  }, { threshold: 0.3 });

  if (vsl) stepObserver.observe(vsl);
})();

// --- Questionnaire section view tracking ---
(function () {
  var q = document.getElementById('questionnaire');
  if (!q) return;
  var qObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        trackEvent('questionnaire_section_view');
        qObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });
  qObserver.observe(q);
})();

// --- CTA click tracking ---
document.querySelectorAll('.btn-primary').forEach(function (btn) {
  btn.addEventListener('click', function () {
    trackEvent('cta_click', { text: btn.textContent.trim().substring(0, 50), page: 'thank-you' });
  });
});
