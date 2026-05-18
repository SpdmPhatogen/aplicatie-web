/* ═══════════════════════════════════════════════════════════════
   GORJ BOOKING – Premium JavaScript
   GSAP + Three.js + ScrollTrigger + Custom Cursor + All interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── 1. LOADING SCREEN ─────────────────────────────────────────────
(function initLoader() {
  const screen  = document.getElementById('loading-screen');
  const bar     = document.querySelector('.loader-bar');
  const percent = document.querySelector('.loader-percent');
  const logo    = document.querySelector('.loader-logo');
  const sub     = document.querySelector('.loader-subtitle');

  if (!screen) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(hideLoader, 400);
    }
    bar.style.width = progress + '%';
    percent.textContent = Math.round(progress) + '%';
  }, 80);

  function hideLoader() {
    // Animate logo out
    gsap.to([logo, sub, bar.parentElement, percent], {
      opacity: 0,
      y: -20,
      stagger: 0.08,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(screen, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            screen.style.display = 'none';
            initHeroAnimation();
          }
        });
      }
    });
  }
})();

// ── 2. CUSTOM CURSOR ──────────────────────────────────────────────
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursor, { x: mouseX, y: mouseY });
  });

  // Smooth follower with RAF
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(follower, { x: followerX, y: followerY });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Scale up on interactive elements
  const interactives = document.querySelectorAll('a, button, .dest-card, .hotel-card, .gallery-item');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor,   { scale: 2,   duration: 0.3 });
      gsap.to(follower, { scale: 1.5, duration: 0.3, borderColor: 'rgba(201,168,76,0.9)' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor,   { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, duration: 0.3, borderColor: 'rgba(201,168,76,0.6)' });
    });
  });
})();

// ── 3. NAVBAR ─────────────────────────────────────────────────────
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('nav-menu');
  if (!navbar) return;

  // Scroll behaviour
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile hamburger
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('open');
    });

    // Close menu on link click
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        menu.classList.remove('open');
      });
    });
  }

  // GSAP intro animation (called after loader)
  window._animateNavbar = function() {
    gsap.fromTo(navbar,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  };
})();

// ── 4. THREE.JS PARTICLE FIELD ────────────────────────────────────
(function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Particle geometry
  const count    = 800;
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    // Gold-ish colors
    const t = Math.random();
    colors[i * 3]     = 0.78 + t * 0.22;   // R
    colors[i * 3 + 1] = 0.62 + t * 0.18;   // G
    colors[i * 3 + 2] = 0.18 + t * 0.15;   // B
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Mouse-driven parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animate
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.003;

    particles.rotation.y = frame * 0.06 + mouseX * 0.08;
    particles.rotation.x = frame * 0.03 - mouseY * 0.06;

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ── 5. HERO ANIMATION (called after loader) ───────────────────────
function initHeroAnimation() {
  if (window._animateNavbar) window._animateNavbar();

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-bg-img', { scale: 1.0, duration: 3, ease: 'power1.out' }, 0)
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9 }, 0.4)
    .to('.hero-title .line', {
      opacity: 1, y: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out'
    }, 0.7)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, 1.3)
    .to('.hero-divider', { opacity: 1, width: 80, duration: 0.9 }, 1.6)
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 1.9)
    .to('.hero-scroll-hint', { opacity: 1, duration: 0.6 }, 2.3)
    .to('.hero-stats', { opacity: 1, duration: 0.8 }, 2.0);

  // Count-up numbers
  setTimeout(() => {
    document.querySelectorAll('.stat-num[data-count]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2.5,
        ease: 'power2.out',
        delay: 0.5,
        onUpdate: function() {
          el.textContent = Math.round(this.targets()[0].val);
        }
      });
    });
  }, 1800);
}

// ── 6. REGISTER GSAP PLUGINS ──────────────────────────────────────
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);
}

// ── 7. SCROLL ANIMATIONS ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {

  // ── Section headers
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.fromTo(header,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 80%', once: true }
      }
    );
  });

  // ── Destination cards – stagger
  gsap.utils.toArray('.dest-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9,
        delay: (i % 3) * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true }
      }
    );
  });

  // ── Hotel cards – slide in
  gsap.utils.toArray('.hotel-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, x: 40 },
      {
        opacity: 1, x: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#hotels', start: 'top 75%', once: true }
      }
    );
  });

  // ── Gallery items
  gsap.utils.toArray('.gallery-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, scale: 0.93 },
      {
        opacity: 1, scale: 1,
        duration: 0.85,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#gallery', start: 'top 80%', once: true }
      }
    );
  });

  // ── About section
  gsap.fromTo('.about-img--back',
    { opacity: 0, x: -50 },
    {
      opacity: 1, x: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '#about', start: 'top 75%', once: true }
    }
  );
  gsap.fromTo('.about-img--front',
    { opacity: 0, x: -30, y: 30 },
    {
      opacity: 1, x: 0, y: 0, duration: 1.2, delay: 0.3, ease: 'power3.out',
      scrollTrigger: { trigger: '#about', start: 'top 75%', once: true }
    }
  );
  gsap.fromTo('.about-text > *',
    { opacity: 0, y: 35 },
    {
      opacity: 1, y: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-text', start: 'top 78%', once: true }
    }
  );

  // ── Experience strip
  gsap.fromTo('.exp-item',
    { opacity: 0, y: 25 },
    {
      opacity: 1, y: 0,
      stagger: 0.08,
      duration: 0.65,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.experiences-strip', start: 'top 88%', once: true }
    }
  );

  // ── Booking section
  gsap.fromTo('.booking-text > *',
    { opacity: 0, x: -40 },
    {
      opacity: 1, x: 0,
      stagger: 0.1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.booking-content', start: 'top 78%', once: true }
    }
  );
  gsap.fromTo('.booking-form-wrap',
    { opacity: 0, x: 40, y: 20 },
    {
      opacity: 1, x: 0, y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.booking-content', start: 'top 78%', once: true }
    }
  );

  // ── Footer
  gsap.fromTo('.footer-top > *',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#footer', start: 'top 88%', once: true }
    }
  );

  // ── Parallax on hero bg
  gsap.to('.hero-bg-img', {
    yPercent: 25,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    }
  });

  // ── Gold line reveal on section dividers
  gsap.utils.toArray('.hero-divider').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => gsap.to(el, { width: 80, opacity: 1, duration: 0.8 })
    });
  });

  // ── Counter animation on scroll-into-view
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  statNums.forEach(el => {
    el.textContent = '0';
  });

});

// ── 8. HOTELS CAROUSEL ────────────────────────────────────────────
(function initHotelsCarousel() {
  const track    = document.getElementById('hotels-track');
  const prevBtn  = document.getElementById('hotels-prev');
  const nextBtn  = document.getElementById('hotels-next');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function getVisible() {
    const w = window.innerWidth;
    if (w > 1100) return 4;
    if (w > 900)  return 3;
    if (w > 600)  return 2;
    return 1;
  }

  function getCardWidth() {
    const card = track.querySelector('.hotel-card');
    if (!card) return 0;
    const style = getComputedStyle(card);
    return card.offsetWidth + parseFloat(style.marginRight || 0) + 24; // 24 = gap approx
  }

  function updateCarousel() {
    const visible  = getVisible();
    const total    = track.querySelectorAll('.hotel-card').length;
    const maxIndex = Math.max(0, total - visible);
    currentIndex   = Math.min(currentIndex, maxIndex);
    const offset   = currentIndex * getCardWidth();
    gsap.to(track, { x: -offset, duration: 0.7, ease: 'power3.inOut' });
  }

  nextBtn.addEventListener('click', () => {
    const visible = getVisible();
    const total   = track.querySelectorAll('.hotel-card').length;
    if (currentIndex < total - visible) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  window.addEventListener('resize', updateCarousel);
})();

// ── 9. FORM SUBMISSION ────────────────────────────────────────────
(function initForm() {
  const form    = document.getElementById('booking-form');
  const success = document.getElementById('form-success');
  const submitBtn = form?.querySelector('.btn-submit');
  if (!form || !success) return;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  const checkin  = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  if (checkin)  checkin.min  = today;
  if (checkout) checkout.min = today;

  checkin && checkin.addEventListener('change', () => {
    if (checkout) checkout.min = checkin.value;
  });

  // Confetti animation function
  function createConfetti() {
    const colors = ['#C9A84C', '#E8C96A', '#8A6D28', '#FFFFFF'];
    const pieces = 50;
    const bookingSection = document.getElementById('booking');
    
    for (let i = 0; i < pieces; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.width = Math.random() * 8 + 4 + 'px';
      confetti.style.height = Math.random() * 8 + 4 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      
      if (bookingSection) {
        bookingSection.appendChild(confetti);
      }
      
      const duration = Math.random() * 2 + 2.5;
      const delay = Math.random() * 0.3;
      const angle = Math.random() * 60 - 30;
      const velocity = Math.random() * 300 + 200;
      
      gsap.to(confetti, {
        y: window.innerHeight + 20,
        x: Math.tan(angle * Math.PI / 180) * window.innerHeight * 0.8,
        opacity: 0,
        rotation: Math.random() * 720 - 360,
        duration: duration,
        delay: delay,
        ease: 'none',
        onComplete: () => confetti.remove()
      });
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        gsap.to(field, {
          borderColor: '#e74c3c',
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          onComplete: () => gsap.to(field, { borderColor: 'rgba(201,168,76,0.2)', duration: 0.3 })
        });
        gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      }
    });

    if (!valid) return;

    // Add loading state to button
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate processing delay
    setTimeout(() => {
      // Animate out form, show success
      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          form.style.display = 'none';
          success.classList.add('active');
          
          // Create confetti effect
          createConfetti();
          
          // Animate success message
          gsap.fromTo(success,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'elastic.out(0.6, 0.6)' }
          );
          
          // Animate success icon with bounce
          gsap.fromTo('.success-icon',
            { scale: 0, rotation: -180 },
            { scale: 1, rotation: 0, duration: 0.8, delay: 0.1, ease: 'elastic.out(0.8, 0.8)' }
          );
          
          // Animate text elements
          gsap.fromTo('.form-success h3',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
          );
          
          gsap.fromTo('.form-success p',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.4 }
          );
        }
      });
    }, 1500); // Loading delay
  });
})();

// ── 10. PARALLAX GLOW EFFECT ON DEST CARDS ────────────────────────
(function initCardParallax() {
  document.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

      gsap.to(card, {
        rotationY: x * 5,
        rotationX: -y * 5,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power1.out'
      });

      gsap.to(card.querySelector('.dest-card-img'), {
        x: x * 8,
        y: y * 6,
        duration: 0.6,
        ease: 'power1.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)'
      });
      gsap.to(card.querySelector('.dest-card-img'), {
        x: 0, y: 0,
        duration: 0.7,
        ease: 'power2.out'
      });
    });
  });
})();

// ── 11. SMOOTH ANCHOR SCROLLING ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    gsap.to(window, {
      duration: 1.4,
      scrollTo: { y: target, offsetY: 70 },
      ease: 'power3.inOut'
    });
  });
});

// ScrollTo plugin fallback (if not loaded)
if (typeof gsap !== 'undefined' && !gsap.plugins.scrollTo) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── 12. IMAGE FALLBACK ────────────────────────────────────────────
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function() {
    // Do not override user-provided external image URLs with fallback sources
    if (this.src.includes('share.google') || this.src.includes('wikipedia.org')) {
      return;
    }

    const fallbacks = [
      'https://www.gstatic.com/webp/gallery/1.sm.jpg',
      'https://www.gstatic.com/webp/gallery/2.sm.jpg',
      'https://www.gstatic.com/webp/gallery/3.sm.jpg'
    ];
    if (!this.dataset.fallbackTried) {
      this.dataset.fallbackTried = '1';
      this.src = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } else {
      // Ultimate fallback: CSS gradient
      this.style.display = 'none';
      const parent = this.closest('.dest-card-img-wrap, .hotel-img-wrap, .gallery-item, .hero-bg, .about-img-stack, .booking-bg');
      if (parent) {
        parent.style.background = 'linear-gradient(135deg, #1a1200 0%, #3d2b00 50%, #1a1200 100%)';
      }
    }
  });
});

// ── 13. GOLD GLOW EFFECT ON HOVER (section titles) ───────────────
document.querySelectorAll('.section-title em, .hero-title .italic').forEach(el => {
  el.classList.add('glow-text');
});

// ── 14. MARQUEE PAUSE ON HOVER ────────────────────────────────────
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

// ── 15. ACTIVE NAV LINK HIGHLIGHTING ─────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      if (
        section.offsetTop <= scrollPos &&
        section.offsetTop + section.offsetHeight > scrollPos
      ) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + section.id) {
            link.style.color = 'var(--gold)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ── 16. GALLERY LIGHTBOX (simple) ────────────────────────────────
// Removed in favor of the shared image modal behavior for all sections.

// ── 17. FOOTER REVEAL ────────────────────────────────────────────
gsap.fromTo('.footer-credits',
  { opacity: 0, y: 20 },
  {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#footer', start: 'top 90%', once: true }
  }
);

// ── Console credit ────────────────────────────────────────────────
console.log(
  '%c GORJ BOOKING \n%c Created by Teodor Becheanu & Popescu Alexandru ',
  'background:#C9A84C; color:#000; font-size:18px; font-weight:bold; padding:8px 20px;',
  'background:#111; color:#C9A84C; font-size:11px; padding:4px 20px; letter-spacing:2px;'
);

// ── 18. IMAGE MODAL INTERACTIONS ───────────────────────────────
(function initImageModal() {
  const modal = document.getElementById('accom-modal');
  const mediaWrap = document.querySelector('.accom-modal-media');
  const titleEl = document.getElementById('accom-modal-title');
  const descEl = document.getElementById('accom-modal-desc');
  const metaEl = document.getElementById('accom-modal-meta');
  const closeBtn = document.getElementById('accom-modal-close');
  const bookBtn = document.getElementById('accom-modal-book');
  if (!modal || !mediaWrap) return;

  function getModalData(img) {
    const section = img.closest('section');
    const card = img.closest('.dest-card, .hotel-card, .gallery-item');
    const title = img.dataset.title ||
      card?.querySelector('.dest-name')?.textContent ||
      card?.querySelector('.hotel-name')?.textContent ||
      img.alt ||
      section?.querySelector('.section-title')?.textContent ||
      '';

    let desc = img.dataset.desc || '';
    let meta = '';

    if (card?.matches('.dest-card')) {
      desc = desc || card.querySelector('.dest-desc')?.textContent || '';
      meta = card.querySelector('.dest-meta')?.innerHTML || '';
    } else if (card?.matches('.hotel-card')) {
      desc = desc || card.querySelector('.hotel-loc')?.textContent || '';
      const price = card.querySelector('.hotel-price')?.textContent?.trim() || '';
      const amenities = Array.from(card.querySelectorAll('.hotel-amenities span')).map(el => el.textContent.trim()).join(' · ');
      meta = [price, amenities].filter(Boolean).join(' · ');
    } else if (card?.matches('.gallery-item')) {
      desc = desc || card.dataset.caption || img.alt || '';
      meta = '';
    } else if (section?.id === 'hero') {
      desc = desc || 'Explorează frumusețea naturală a Gorjului și planifică o experiență memorabilă în inima munților.';
      meta = 'Hero · Gorj Booking';
    } else if (section?.id === 'booking') {
      desc = desc || 'Completează formularul pentru rezervarea ta. Echipa noastră va reveni în maxim 24 de ore.';
      meta = ''; 
    }

    return { title, desc, meta };
  }

  function openModalFromImage(img) {
    const src = img.getAttribute('src') || img.currentSrc || img.src || img.dataset.src || '';
    const section = img.closest('section');
    const { title, desc, meta } = getModalData(img);
    const newImg = document.createElement('img');
    newImg.style.width = '100%';
    newImg.style.height = '100%';
    newImg.style.objectFit = 'cover';
    newImg.style.display = 'block';
    newImg.style.opacity = '0';
    newImg.style.transition = 'opacity 0.35s ease';
    newImg.alt = title;
    newImg.onload = () => { newImg.style.opacity = '1'; };
    newImg.onerror = () => {
      newImg.alt = 'Imagine indisponibilă';
      newImg.style.opacity = '1';
    };
    newImg.src = src;

    mediaWrap.innerHTML = '';
    mediaWrap.appendChild(newImg);

    titleEl.textContent = title;
    descEl.textContent = desc;
    metaEl.innerHTML = meta;
    if (bookBtn) {
      bookBtn.style.display = section?.id === 'gallery' ? 'none' : '';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('.accom-modal-card', { y: 30, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
  }

  function closeModal() {
    gsap.to('.accom-modal-card', { y: 20, opacity: 0, scale: 0.98, duration: 0.25, onComplete: () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      mediaWrap.innerHTML = '';
      titleEl.textContent = '';
      descEl.textContent = '';
      metaEl.innerHTML = '';
      if (bookBtn) bookBtn.style.display = '';
    }});
  }

  document.querySelectorAll('section:not(#about) img').forEach(img => {
    const section = img.closest('section');
    if (!section) return;
    if (img.closest('#accom-modal')) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', e => {
      e.stopPropagation();
      openModalFromImage(img);
    });
  });

  closeBtn && closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
