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

// --- Bridge → Solution scroll overlap ---
(function () {
  var problem = document.querySelector('.bridge-stack-problem');
  var solution = document.querySelector('.bridge-stack-solution');
  if (!problem || !solution || window.innerWidth < 900) return;

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var pRect = problem.getBoundingClientRect();
      var vh = window.innerHeight;
      // How far the problem card's bottom is from the viewport center
      // When problem card bottom is at viewport bottom → progress 0
      // When problem card bottom reaches viewport top → progress 1
      var progress = 1 - (pRect.bottom / vh);
      progress = Math.max(0, Math.min(1, progress));

      // Overlap distance: solution card moves up by up to the full problem card height
      var overlap = progress * (problem.offsetHeight + 48);
      solution.style.transform = 'translateY(-' + overlap + 'px)';

      // Fade & scale down the problem card slightly as it gets covered
      var fadeProgress = Math.max(0, Math.min(1, progress * 1.5));
      problem.style.opacity = 1 - (fadeProgress * 0.4);
      problem.style.transform = 'scale(' + (1 - fadeProgress * 0.04) + ')';

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

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

// --- Consolidated scroll handler (nav, parallax) ---
var nav = document.getElementById('nav');
var applySection = document.getElementById('apply');
var orbs = document.querySelectorAll('.ambient .orb');

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

// --- Video testimonial play tracking ---
document.querySelectorAll('.video-testimonial-card wistia-player').forEach(function (player) {
  player.addEventListener('play', function () {
    trackEvent('video_play', { video: 'testimonial_' + (player.getAttribute('media-id') || 'unknown') });
  });
});

// --- Video modal (founders + DM) ---
(function () {
  var modal = document.getElementById('video-modal');
  var player = document.getElementById('video-modal-player');
  var closeBtn = document.getElementById('video-modal-close');
  if (!modal) return;

  function openModal(html, eventName) {
    player.innerHTML = html;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (eventName) trackEvent(eventName);
  }

  function closeModal() {
    modal.classList.remove('active');
    player.innerHTML = '';
    document.body.style.overflow = '';
  }

  // Founders video (YouTube)
  var foundersTrigger = document.getElementById('founders-video-trigger');
  if (foundersTrigger) {
    foundersTrigger.addEventListener('click', function () {
      openModal('<iframe src="https://www.youtube.com/embed/CgcUq1e6P3I?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>', 'founders_video_open');
    });
  }

  // Delegation Mastermind video (Wistia)
  var dmTrigger = document.querySelector('.dm-video-trigger');
  if (dmTrigger) {
    dmTrigger.addEventListener('click', function () {
      openModal('<iframe src="https://fast.wistia.com/embed/iframe/2vsk3vtwgi?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>', 'dm_video_open');
    });
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
})();

// --- CTA click tracking ---
document.querySelectorAll('.btn-primary, .nav-cta').forEach(function (btn) {
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
