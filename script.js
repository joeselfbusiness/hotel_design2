/* =============================================
   COMFORT STAY HOTEL - script.js
   Interactive Functionality & Animations
   ============================================= */

'use strict';

// ============================================================
// UTILITY HELPERS
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ============================================================
// 1. PRELOADER
// ============================================================
window.addEventListener('load', () => {
  const preloader = $('#preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 600);
});
document.body.style.overflow = 'hidden';

// ============================================================
// 2. NAVBAR – scroll effect + active link
// ============================================================
const navbar = $('#navbar');
const navLinks = $$('.nav-link');
const sections = $$('section[id]');

window.addEventListener('scroll', () => {
  // Scrolled class
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Scroll-to-top button
  const scrollTop = $('#scroll-top');
  scrollTop.classList.toggle('visible', window.scrollY > 400);

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}, { passive: true });

// Scroll to top button
$('#scroll-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============================================================
// 3. HAMBURGER MENU
// ============================================================
const hamburger = $('#hamburger');
const navLinksMenu = $('#nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksMenu.classList.toggle('open');
});

// Close menu on nav link click
navLinksMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksMenu.classList.remove('open');
  });
});

// ============================================================
// 4. INTERSECTION OBSERVER – scroll animations
// ============================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      // Stagger children with delay classes
      if (entry.target.classList.contains('rooms-grid') ||
          entry.target.classList.contains('amenities-grid')) {
        const cards = entry.target.querySelectorAll('.animate-up');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('in-view'), i * 100);
        });
      }
    }
  });
}, { threshold: 0.12 });

$$('.animate-left, .animate-right, .animate-up').forEach(el => observer.observe(el));

// ============================================================
// 5. QUICK BOOKING STRIP – set min dates
// ============================================================
(function initStripDates() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkin = $('#strip-checkin');
  const checkout = $('#strip-checkout');
  if (checkin) { checkin.min = today; checkin.value = today; }
  if (checkout) { checkout.min = tomorrow; checkout.value = tomorrow; }
})();

window.stripCheck = function() {
  const ci = $('#strip-checkin').value;
  const co = $('#strip-checkout').value;
  const guests = $('#strip-guests').value;
  if (!ci || !co) {
    showToast('Please select check-in and check-out dates.', 'error');
    return;
  }
  if (new Date(co) <= new Date(ci)) {
    showToast('Check-out must be after check-in date.', 'error');
    return;
  }
  // Pre-fill inquiry form and scroll to it
  const inqCheckin = $('#inq-checkin');
  const inqCheckout = $('#inq-checkout');
  const inqGuests = $('#inq-guests');
  if (inqCheckin) inqCheckin.value = ci;
  if (inqCheckout) inqCheckout.value = co;
  if (inqGuests) {
    const numGuests = guests.split(' ')[0];
    const option = [...inqGuests.options].find(o => o.value === numGuests);
    if (option) inqGuests.value = option.value;
  }
  document.querySelector('#inquiry').scrollIntoView({ behavior: 'smooth' });
  showToast('Dates pre-filled! Complete your inquiry below.', 'success');
};

// ============================================================
// 6. FORM VALIDATION HELPERS
// ============================================================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^[\+\d\s\-\(\)]{7,15}$/.test(phone.trim());
}
function setError(inputId, errId, msg) {
  const inp = $('#' + inputId);
  const err = $('#' + errId);
  if (inp) inp.classList.toggle('invalid', !!msg);
  if (err) err.textContent = msg || '';
}
function clearErrors(ids) {
  ids.forEach(id => {
    const el = $('#' + id);
    if (el) { el.classList.remove('invalid'); }
  });
}

// ============================================================
// 7. INQUIRY FORM
// ============================================================
(function initInquiryForm() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const ci = $('#inq-checkin');
  const co = $('#inq-checkout');
  if (ci) { ci.min = today; ci.value = today; }
  if (co) { co.min = tomorrow; co.value = tomorrow; }
})();

$('#inquiry-form').addEventListener('submit', function(e) {
  e.preventDefault();
  let valid = true;

  const fields = ['inq-name', 'inq-phone', 'inq-checkin', 'inq-checkout', 'inq-room', 'inq-guests'];
  clearErrors(fields);

  const name = $('#inq-name').value.trim();
  const phone = $('#inq-phone').value.trim();
  const checkin = $('#inq-checkin').value;
  const checkout = $('#inq-checkout').value;
  const room = $('#inq-room').value;
  const guests = $('#inq-guests').value;
  const email = $('#inq-email').value.trim();

  if (!name || name.length < 2) { setError('inq-name', 'inq-name-err', 'Please enter your full name.'); valid = false; }
  if (!phone || !validatePhone(phone)) { setError('inq-phone', 'inq-phone-err', 'Enter a valid phone number.'); valid = false; }
  if (!checkin) { setError('inq-checkin', 'inq-checkin-err', 'Select a check-in date.'); valid = false; }
  if (!checkout) { setError('inq-checkout', 'inq-checkout-err', 'Select a check-out date.'); valid = false; }
  if (checkin && checkout && new Date(checkout) <= new Date(checkin)) {
    setError('inq-checkout', 'inq-checkout-err', 'Check-out must be after check-in.'); valid = false;
  }
  if (!room) { setError('inq-room', 'inq-room-err', 'Please select a room type.'); valid = false; }
  if (!guests) { setError('inq-guests', 'inq-guests-err', 'Select number of guests.'); valid = false; }
  if (email && !validateEmail(email)) { setError('inq-email', 'inq-email-err', 'Enter a valid email address.'); valid = false; }

  if (!valid) return;

  // Submit animation
  const btn = $('#inq-submit');
  btn.innerHTML = '<span>Sending…</span>';
  btn.disabled = true;

  setTimeout(() => {
    // Build WhatsApp message
    const roomMap = { standard: 'Standard Single (₹799/night)', deluxe: 'Deluxe Double (₹1,299/night)', suite: 'Premium Suite (₹2,199/night)' };
    const msg = encodeURIComponent(
      `New Booking Inquiry – Comfort Stay Hotel\n\n` +
      `Name: ${name}\nPhone: ${phone}\n` +
      `Check-in: ${checkin}\nCheck-out: ${checkout}\n` +
      `Room: ${roomMap[room] || room}\nGuests: ${guests}\n` +
      `Email: ${email || 'Not provided'}\n\n` +
      `Special Requests: ${$('#inq-message').value.trim() || 'None'}`
    );
    // Show success
    $('#inquiry-form').classList.add('hidden');
    $('#inq-success').classList.remove('hidden');
    $('#inq-success').querySelector('a').href = `https://wa.me/919876543210?text=${msg}`;
    showToast('Inquiry sent! We\'ll contact you shortly.', 'success');
  }, 1400);
});

// ============================================================
// 8. CONTACT FORM
// ============================================================
$('#contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  let valid = true;

  clearErrors(['con-name', 'con-email', 'con-subject', 'con-message']);

  const name = $('#con-name').value.trim();
  const email = $('#con-email').value.trim();
  const subject = $('#con-subject').value.trim();
  const message = $('#con-message').value.trim();

  if (!name || name.length < 2) { setError('con-name', 'con-name-err', 'Please enter your name.'); valid = false; }
  if (!email || !validateEmail(email)) { setError('con-email', 'con-email-err', 'Enter a valid email address.'); valid = false; }
  if (!subject || subject.length < 3) { setError('con-subject', 'con-subject-err', 'Please enter a subject.'); valid = false; }
  if (!message || message.length < 10) { setError('con-message', 'con-message-err', 'Message must be at least 10 characters.'); valid = false; }

  if (!valid) return;

  const btn = $('#con-submit');
  btn.innerHTML = '<span>Sending…</span>';
  btn.disabled = true;

  setTimeout(() => {
    $('#contact-form').classList.add('hidden');
    $('#con-success').classList.remove('hidden');
    showToast('Message sent! We\'ll reply within 24 hours.', 'success');
  }, 1200);
});

// ============================================================
// 9. GALLERY LIGHTBOX
// ============================================================
(function initLightbox() {
  const items = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const backdrop = $('#lightbox-backdrop');
  const img = $('#lightbox-img');
  const caption = $('#lightbox-caption');
  const closeBtn = $('#lightbox-close');
  const prevBtn = $('#lightbox-prev');
  const nextBtn = $('#lightbox-next');
  let current = 0;

  function openLightbox(index) {
    current = index;
    const item = items[current];
    img.src = item.dataset.src;
    img.alt = item.dataset.caption;
    caption.textContent = item.dataset.caption;
    lightbox.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    img.style.opacity = '0';
    setTimeout(() => {
      const item = items[current];
      img.src = item.dataset.src;
      img.alt = item.dataset.caption;
      caption.textContent = item.dataset.caption;
      img.style.opacity = '1';
    }, 150);
  }

  img.style.transition = 'opacity 0.15s ease';

  items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

// ============================================================
// 10. REVIEWS SLIDER
// ============================================================
(function initReviewSlider() {
  const slider = $('#reviews-slider');
  if (!slider) return;
  const cards = $$('.review-card', slider);
  const dotsContainer = $('#rev-dots');
  const prevBtn = $('#rev-prev');
  const nextBtn = $('#rev-next');
  let current = 0;
  let autoInterval;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'rev-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    slider.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    $$('.rev-dot', dotsContainer).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() { autoInterval = setInterval(() => goTo(current + 1), 5000); }
  function stopAuto() { clearInterval(autoInterval); }

  slider.style.display = 'flex';
  slider.style.transition = 'transform 0.5s ease';

  prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Touch/swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
  }, { passive: true });

  startAuto();
})();

// ============================================================
// 11. FAQ ACCORDION
// ============================================================
$$('.faq-item').forEach(item => {
  const btn = $('.faq-q', item);
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    $$('.faq-item').forEach(fi => {
      fi.classList.remove('open');
      $('.faq-q', fi).setAttribute('aria-expanded', 'false');
    });
    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ============================================================
// 12. SMOOTH SCROLL for all anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ============================================================
// 13. TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed; top: 90px; right: 20px; z-index: 9999;
    background: ${type === 'success' ? 'rgba(63,185,80,0.95)' : type === 'error' ? 'rgba(248,81,73,0.95)' : 'rgba(88,166,255,0.95)'};
    color: white; padding: 14px 20px; border-radius: 12px;
    font-size: 0.9rem; font-weight: 600;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    display: flex; align-items: center; gap: 10px;
    backdrop-filter: blur(10px);
    transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    max-width: 320px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ============================================================
// 14. NUMBER COUNTER ANIMATION (hero stats)
// ============================================================
(function initCounters() {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = el.dataset.prefix + (isDecimal ? val.toFixed(1) : Math.floor(val)) + el.dataset.suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  // Tag elements for counting
  const statNums = [
    { sel: '.hero-stats .stat-num:nth-child(1)', target: 500, prefix: '', suffix: '+' },
    { sel: '.rev-big-num:first-of-type', target: 4.8, prefix: '', suffix: '' }
  ];
  // Simple approach: just observe hero stats section
})();

// ============================================================
// 15. PARALLAX EFFECT on hero
// ============================================================
const heroBg = $('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1) translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

// ============================================================
// 16. CARD TILT EFFECT (subtle 3D on room cards)
// ============================================================
$$('.room-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => card.style.transition = '', 500);
  });
});

// ============================================================
// 17. AMENITY CARD HOVER SHIMMER
// ============================================================
$$('.amenity-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ============================================================
// 18. DATE INPUT CONSTRAINTS
// ============================================================
(function setDateConstraints() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const allCheckins = $$('input[type="date"][id$="checkin"]');
  const allCheckouts = $$('input[type="date"][id$="checkout"]');
  allCheckins.forEach(el => { el.min = today; if (!el.value) el.value = today; });
  allCheckouts.forEach(el => { el.min = tomorrow; if (!el.value) el.value = tomorrow; });
})();

// Auto-set checkout when checkin changes
$('#inq-checkin')?.addEventListener('change', function() {
  const nextDay = new Date(this.value);
  nextDay.setDate(nextDay.getDate() + 1);
  const co = $('#inq-checkout');
  if (co) {
    co.min = nextDay.toISOString().split('T')[0];
    if (!co.value || new Date(co.value) <= new Date(this.value)) {
      co.value = nextDay.toISOString().split('T')[0];
    }
  }
});

// ============================================================
// 19. INITIAL ANIMATIONS – trigger visible items
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Trigger any already-visible elements
  $$('.animate-left, .animate-right, .animate-up').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) el.classList.add('in-view');
  });
});

console.log('%c🏨 Comfort Stay Hotel Website', 'color: #c9a84c; font-size: 1.2rem; font-weight: bold;');
console.log('%cBuilt with ❤️ for an amazing guest experience.', 'color: #8b949e;');
