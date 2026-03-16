/* ═══════════════════════════════════
   PARETO RIGHT HAND — MAIN JS
   ═══════════════════════════════════ */

// --- Analytics helper ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

// --- UTM forwarding to HighLevel calendar iframe ---
(function forwardUTMs() {
  var iframe = document.querySelector('.booking-widget iframe');
  if (!iframe) return;
  var params = new URLSearchParams(window.location.search);
  var utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var hasUTM = false;
  var iframeUrl;
  try {
    iframeUrl = new URL(iframe.src);
  } catch (e) {
    return;
  }
  utms.forEach(function (key) {
    if (params.has(key)) {
      iframeUrl.searchParams.set(key, params.get(key));
      hasUTM = true;
    }
  });
  if (hasUTM) {
    iframe.src = iframeUrl.toString();
  }
})();

// --- Scroll reveal ---
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

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

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Consolidated scroll handler (nav, parallax, floating CTA) ---
var nav = document.getElementById('nav');
var applySection = document.getElementById('apply');
var orbs = document.querySelectorAll('.ambient .orb');
var floatingCta = document.createElement('a');
floatingCta.className = 'floating-cta btn-primary';
floatingCta.href = '#apply';
floatingCta.textContent = 'Book Your Call';
document.body.appendChild(floatingCta);

var ticking = false;
window.addEventListener('scroll', function () {
  if (!ticking) {
    requestAnimationFrame(function () {
      var y = window.scrollY;

      // Nav scroll state
      if (nav) nav.classList.toggle('scrolled', y > 60);

      // Parallax on ambient orbs (GPU-composited)
      orbs.forEach(function (orb, i) {
        var speed = 0.02 + (i * 0.01);
        orb.style.transform = 'translate3d(0,' + (y * speed) + 'px,0)';
      });

      // Floating CTA visibility
      if (applySection) {
        var applyRect = applySection.getBoundingClientRect();
        var scrolled = y > 600;
        var nearApply = applyRect.top < 200;
        if (scrolled && !nearApply) {
          floatingCta.classList.add('show');
        } else {
          floatingCta.classList.remove('show');
        }
      }

      ticking = false;
    });
    ticking = true;
  }
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

// --- Mitch Barham click-to-play video testimonial ---
var mitchContainer = document.getElementById('mitch-video-container');
if (mitchContainer) {
  mitchContainer.addEventListener('click', function () {
    var thumb = document.getElementById('mitch-thumbnail');
    var playBtn = document.getElementById('mitch-play-btn');
    if (thumb) thumb.style.display = 'none';
    if (playBtn) playBtn.style.display = 'none';
    var player = document.createElement('wistia-player');
    player.setAttribute('media-id', 'sw5w2b28uk');
    player.setAttribute('aspect', '0.5625');
    player.setAttribute('autoplay', '');
    player.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;';
    mitchContainer.style.position = 'relative';
    mitchContainer.appendChild(player);
    trackEvent('video_play', { video: 'mitch_barham_testimonial' });
  });
}

// --- CTA click tracking ---
document.querySelectorAll('.btn-primary, .nav-cta, .floating-cta').forEach(function (btn) {
  btn.addEventListener('click', function () {
    trackEvent('cta_click', { text: btn.textContent.trim().substring(0, 50) });
  });
});

// --- Booking section view tracking ---
var bookingObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      trackEvent('booking_section_view');
      bookingObserver.disconnect();
    }
  });
}, { threshold: 0.2 });

if (applySection) bookingObserver.observe(applySection);

// --- Calendar widget load tracking ---
var calendarIframe = document.querySelector('.booking-widget iframe');
if (calendarIframe) {
  calendarIframe.addEventListener('load', function () {
    trackEvent('calendar_widget_load');
  });
}
