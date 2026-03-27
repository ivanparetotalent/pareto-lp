/* ═══════════════════════════════════
   PARETO RIGHT HAND — MAIN JS
   ═══════════════════════════════════ */

// --- Analytics helper ---
function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

// --- Mobile burger menu ---
(function () {
  var burger = document.getElementById('nav-burger');
  var navLinks = document.getElementById('nav-links');
  if (!burger || !navLinks) return;
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();

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
  duration: 1.1,
  easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
  smoothWheel: false,
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

      // Scroll progress bar
      var progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (y / docHeight * 100) + '%';
      }

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

// --- Scroll-driven frame animation ---
(function () {
  var canvas = document.getElementById('scroll-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var container = document.getElementById('scroll-animation');
  var TOTAL_FRAMES = 73;
  var frames = [];
  var loaded = 0;
  var currentFrame = -1;
  var rafPending = false;

  // Retina support
  function sizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.parentElement.offsetWidth * dpr;
    canvas.height = canvas.parentElement.offsetHeight * dpr;
    canvas.style.width = canvas.parentElement.offsetWidth + 'px';
    canvas.style.height = canvas.parentElement.offsetHeight + 'px';
  }
  sizeCanvas();
  window.addEventListener('resize', function () { sizeCanvas(); drawFrame(currentFrame); });

  // Preload frames
  for (var i = 1; i <= TOTAL_FRAMES; i++) {
    var img = new Image();
    img.src = 'img/scroll-frames/frame_' + String(i).padStart(4, '0') + '.jpg';
    img.onload = function () {
      loaded++;
      if (loaded === TOTAL_FRAMES) drawFrame(0);
    };
    frames.push(img);
  }

  function drawFrame(index) {
    if (index < 0) index = 0;
    if (index >= TOTAL_FRAMES) index = TOTAL_FRAMES - 1;
    if (currentFrame === index) return;
    currentFrame = index;

    var img = frames[index];
    if (!img || !img.complete) return;

    var cw = canvas.width;
    var ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Contain-fit drawing (centered, no crop)
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    var scale = Math.min(cw / iw, ch / ih);
    var sw = iw * scale;
    var sh = ih * scale;
    var sx = (cw - sw) / 2;
    var sy = (ch - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
  }

  window.addEventListener('scroll', function () {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      var rect = container.getBoundingClientRect();
      var scrollTop = -rect.top;
      var scrollHeight = container.offsetHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      var progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
      var frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
      drawFrame(frameIndex);
    });
  }, { passive: true });
})();

// --- VSL scroll-grow effect (sticky + scale) ---
(function () {
  var section = document.getElementById('vsl-scroll-section');
  var vsl = document.getElementById('vsl-grow');
  if (!section || !vsl || window.innerWidth < 768) return;

  var rafP = false;
  window.addEventListener('scroll', function () {
    if (rafP) return;
    rafP = true;
    requestAnimationFrame(function () {
      rafP = false;
      var rect = section.getBoundingClientRect();
      var scrollTop = -rect.top;
      var scrollHeight = section.offsetHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      var progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
      // Scale from 0.6 to 1.0 in first 40% of scroll, then hold at 1.0
      var scaleProgress = Math.min(1, progress / 0.4);
      var scale = 0.6 + (scaleProgress * 0.4);
      vsl.style.transform = 'scale(' + scale + ')';
    });
  }, { passive: true });
})();

// --- Tab title blink when user leaves ---
(function () {
  var originalTitle = document.title;
  // Cycle: short phrase → follow-up → pause with original → repeat
  var sequence = [
    '👋 Don\'t forget...',
    '📞 Book your call!',
    '⏰ Spots are limited',
    '🔥 Don\'t miss out...'
  ];
  var blinkInterval = null;
  var step = 0;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      step = 0;
      // Show first message immediately
      document.title = sequence[0];
      blinkInterval = setInterval(function () {
        step++;
        // Alternate: message → original title → message → original...
        if (step % 2 === 0) {
          var msgIdx = Math.floor(step / 2) % sequence.length;
          document.title = sequence[msgIdx];
        } else {
          document.title = originalTitle;
        }
      }, 2000);
    } else {
      clearInterval(blinkInterval);
      blinkInterval = null;
      document.title = originalTitle;
    }
  });
})();
