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
  const interactives = document.querySelectorAll('a, button, .dest-card, .hotel-card, .location-card, .gallery-item');
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

// ── 9. ACCOMMODATION MAP & DETAILS ───────────────────────────────
(function initAccommodationMap() {
  const accommodations = [
    {
      id: 'hotel-gorj',
      name: 'Hotel Gorj',
      region: 'Târgu Jiu',
      short: 'Hotel confortabil în centrul orașului, lângă operele lui Brâncuși.',
      description: 'Hotel Gorj este alegerea ideală pentru vizite culturale în Târgu Jiu, cu camere moderne, mic dejun inclus și acces rapid la principalele atracții din județul Gorj.',
      price: '€120 / noapte',
      rating: '4 ★',
      amenities: ['Mic dejun inclus', 'WiFi gratuit', 'Parcare', 'Recepție 24h'],
      googleQuery: 'Hotel+Gorj+Targu+Jiu+Gorj+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Gorj+Targu+Jiu+Gorj+Romania',
      images: [
        'https://images.unsplash.com/photo-1501117716987-c8eaa5d0f0f8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '52%', top: '62%' },
      distanceFromPrevious: '0 km (prima locație)',
      previous: 'Prima cazare din listă'
    },
    {
      id: 'hotel-central',
      name: 'Hotel Central Târgu Jiu',
      region: 'Târgu Jiu',
      short: 'Hotel modern în inima orașului, ideal pentru city break-uri.',
      description: 'Hotel Central oferă camere elegante, restaurant cu specific local și o poziție centrală foarte bună pentru explorarea orașului și a obiectivelor turistice din Gorj.',
      price: '€105 / noapte',
      rating: '4 ★',
      amenities: ['Camere moderne', 'Mic dejun', 'WiFi', 'Serviciu room service'],
      googleQuery: 'Hotel+Central+Targu+Jiu+Gorj+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Central+Targu+Jiu+Gorj+Romania',
      images: [
        'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '54%', top: '65%' },
      distanceFromPrevious: '2 km / 6 min',
      previous: 'Hotel Gorj'
    },
    {
      id: 'casa-gorjeana',
      name: 'Casa Gorjeană',
      region: 'Târgu Jiu',
      short: 'Pensiune boutique cu atmosferă autentică oltenească.',
      description: 'Casa Gorjeană combină ospitalitatea locală cu facilități confortabile și este o opțiune excelentă pentru cine caută o experiență autentică de cazare în Gorj.',
      price: '€90 / noapte',
      rating: '4 ★',
      amenities: ['Terasa', 'WiFi', 'Mic dejun tradițional', 'Grădină'],
      googleQuery: 'Casa+Gorjeana+Targu+Jiu+Gorj+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Casa+Gorjeana+Targu+Jiu+Gorj+Romania',
      images: [
        'https://images.unsplash.com/photo-1551907236-4eecd230f69b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '51%', top: '67%' },
      distanceFromPrevious: '1.5 km / 5 min',
      previous: 'Hotel Central Târgu Jiu'
    },
    {
      id: 'vila-ozon-ranca',
      name: 'Vila Ozon Rânca',
      region: 'Rânca',
      short: 'Vila de munte cu camere moderne și vedere către vârfuri.',
      description: 'Vila Ozon Rânca este foarte apreciată de iubitorii de munte, cu camere confortabile, acces rapid la pârtii și o ambianță prietenoasă.',
      price: '€70 / noapte',
      rating: '4 ★',
      amenities: ['WiFi', 'Mic dejun', 'Parcare', 'Saună'],
      googleQuery: 'Vila+Ozon+Ranca+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Vila+Ozon+Ranca+Romania',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '60%', top: '38%' },
      distanceFromPrevious: '32 km / 44 min',
      previous: 'Casa Gorjeană'
    },
    {
      id: 'pensiunea-alpin',
      name: 'Pensiunea Alpin',
      region: 'Rânca',
      short: 'Spațiu confortabil cu note elegante, aproape de pârtii.',
      description: 'Pensiunea Alpin oferă camere moderne, atmosferă caldă și acces ușor la principalele puncte de interes din Rânca.',
      price: '€82 / noapte',
      rating: '4 ★',
      amenities: ['Mic dejun', 'WiFi', 'Grădină', 'Șemineu'],
      googleQuery: 'Pensiunea+Alpin+Ranca+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Pensiunea+Alpin+Ranca+Romania',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '58%', top: '34%' },
      distanceFromPrevious: '4 km / 9 min',
      previous: 'Vila Ozon Rânca'
    },
    {
      id: 'pensiunea-antonia',
      name: 'Pensiunea Antonia Spa',
      region: 'Transalpina / Rânca',
      short: 'Spa modern și panoramă 180° către Munții Parâng.',
      description: 'Pensiunea Antonia Spa oferă facilități wellness, camere spațioase și o priveliște impresionantă, potrivită pentru relaxare după drumeții.',
      price: '€115 / noapte',
      rating: '5 ★',
      amenities: ['Spa', 'Jacuzzi', 'WiFi', 'Terasa'],
      googleQuery: 'Pensiunea+Antonia+Spa+Ranca+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Pensiunea+Antonia+Spa+Ranca+Romania',
      images: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '62%', top: '30%' },
      distanceFromPrevious: '6 km / 12 min',
      previous: 'Pensiunea Alpin'
    },
    {
      id: 'cabana-terra',
      name: 'Cabana Terra',
      region: 'Rânca',
      short: 'Cabana cu restaurant și mâncare tradițională, aproape de natură.',
      description: 'Cabana Terra este recunoscută pentru ospitalitatea locală și restaurantul său, oferind camere calde și un ambient relaxant după o zi de drumeții.',
      price: '€95 / noapte',
      rating: '4 ★',
      amenities: ['Restaurant', 'WiFi', 'Parcare', 'Spațiu evenimente'],
      googleQuery: 'Cabana+Terra+Ranca+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Cabana+Terra+Ranca+Romania',
      images: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '61%', top: '37%' },
      distanceFromPrevious: '2.5 km / 7 min',
      previous: 'Pensiunea Antonia Spa'
    },
    {
      id: 'pensiunea-tismana',
      name: 'Pensiunea Tismana Forest Retreat',
      region: 'Tismana',
      short: 'Retreat eco și wellness în pădurea de lângă Mănăstirea Tismana.',
      description: 'Această pensiune eco este o enclavă liniștită în padure, perfectă pentru relaxare și pentru cei care vor să exploreze zona istorică a Tismanei.',
      price: '€98 / noapte',
      rating: '4 ★',
      amenities: ['Natură', 'WiFi', 'Mic dejun tradițional', 'Povești locale'],
      googleQuery: 'Pensiunea+Tismana+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Pensiunea+Tismana+Romania',
      images: [
        'https://images.unsplash.com/photo-1501117716987-c8eaa5d0f0f8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '24%', top: '46%' },
      distanceFromPrevious: '76 km / 1h 30 min',
      previous: 'Cabana Terra'
    },
    {
      id: 'taverna-olteanului',
      name: 'Taverna Olteanului',
      region: 'Baia de Fier',
      short: 'Pensiune cu restaurant tradițional, ideală pentru grupuri.',
      description: 'Taverna Olteanului este apreciată pentru restaurantul său tradițional și cazarea confortabilă, cu acces rapid la Peștera Muierilor și Cheile Sohodolului.',
      price: '€85 / noapte',
      rating: '4 ★',
      amenities: ['Restaurant tradițional', 'Parcare', 'WiFi', 'Camere spațioase'],
      googleQuery: 'Taverna+Olteanului+Baia+de+Fier+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Taverna+Olteanului+Baia+de+Fier+Romania',
      images: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '64%', top: '50%' },
      distanceFromPrevious: '29 km / 35 min',
      previous: 'Pensiunea Tismana Forest Retreat'
    },
    {
      id: 'vila-alpina',
      name: 'Vila Alpina Transalpina',
      region: 'Transalpina',
      short: 'Vila privată de munte cu șemineu și panoramă către Transalpina.',
      description: 'Vila Alpina este o opțiune premium pentru cei care doresc o experiență exclusivă la munte, aproape de șoseaua Transalpina și de natură.',
      price: '€180 / noapte',
      rating: '5 ★',
      amenities: ['Șemineu', 'Jacuzzi', 'WiFi', 'Grătar', 'Vedere spre munte'],
      googleQuery: 'Vila+Alpina+Transalpina+Romania',
      googleUrl: 'https://www.google.com/maps/search/?api=1&query=Vila+Alpina+Transalpina+Romania',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
      ],
      position: { left: '74%', top: '28%' },
      distanceFromPrevious: '18 km / 28 min',
      previous: 'Taverna Olteanului'
      ,
      roomTypes: [
        { id: 'standard', name: 'Standard', price: 180, capacity: 2 },
        { id: 'deluxe', name: 'Deluxe', price: 230, capacity: 4 }
      ]
    }
  ];

  const listContainer = document.getElementById('accom-locations');
  const mapFrame = document.getElementById('accom-map-frame');
  const detailPanel = document.getElementById('accom-detail-panel');
  const detailTitle = document.getElementById('accom-detail-title');
  const detailText = document.getElementById('accom-detail-text');
  const detailMeta = document.getElementById('accom-detail-meta');
  const detailDist = document.getElementById('accom-detail-dist');
  const detailGallery = document.getElementById('accom-detail-gallery');
  const detailGoogle = document.getElementById('accom-detail-google');
  const mapFrameIframe = document.getElementById('google-map-frame');
  const detailClose = document.getElementById('accom-detail-close');
  const detailCloseBtn = document.getElementById('accom-detail-closebtn');

  if (!listContainer || !mapFrame || !detailPanel) return;

  function makeCard(location) {
    const card = document.createElement('article');
    card.className = 'location-card';
    card.dataset.id = location.id;
    card.innerHTML = `
      <div class="location-card-main">
        <span class="location-card-region">${location.region}</span>
        <h3 class="location-card-title">${location.name}</h3>
        <div class="location-card-meta">
          <span>${location.rating}</span>
          <span>·</span>
          <span>${location.price}</span>
        </div>
        <div class="location-card-actions">
          <button type="button" class="btn-primary location-reserve">Rezervă</button>
        </div>
      </div>
      <div class="location-card-hover">${location.short}</div>
    `;
    card.addEventListener('click', () => openLocation(location.id));

    const reserveBtn = card.querySelector('.location-reserve');
    if (reserveBtn) {
      reserveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openBookingFor && openBookingFor(location.id);
      });
    }
    return card;
  }

  function makePin(location) {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'accom-map-pin';
    pin.dataset.id = location.id;
    pin.dataset.title = location.name;
    pin.style.left = location.position.left;
    pin.style.top = location.position.top;
    pin.addEventListener('click', () => openLocation(location.id));
    return pin;
  }

  function openLocation(id) {
    const location = accommodations.find(item => item.id === id);
    if (!location) return;

    detailTitle.textContent = location.name;
    detailText.textContent = location.description;
    detailMeta.innerHTML = `
      <strong>Regiune:</strong> ${location.region} · <strong>Preț:</strong> ${location.price}<br>
      <strong>Rating:</strong> ${location.rating} · <strong>Facilități:</strong> ${location.amenities.join(' · ')}
    `;
    detailDist.innerHTML = `
      <strong>Distanță față de locația precedentă:</strong> ${location.distanceFromPrevious}<br>
      <strong>Previzualizare:</strong> ${location.previous}
    `;
    detailGoogle.href = location.googleUrl;
    detailGoogle.textContent = 'Vezi pe Google Maps';
    mapFrameIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(location.googleQuery)}&output=embed`;

    detailGallery.innerHTML = '';
    location.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = location.name;
      detailGallery.appendChild(img);
    });

    detailPanel.classList.remove('hidden');
    detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeDetails() {
    detailPanel.classList.add('hidden');
  }

  accommodations.forEach(location => {
    listContainer.appendChild(makeCard(location));
    mapFrame.appendChild(makePin(location));
  });

  // expose accommodations for other modules (e.g., reservation renderer)
  window.GORJ_ACCOMMODATIONS = accommodations;

  // Populate accommodation select with dynamic room types
  const accomSelect = document.getElementById('accommodation');
  const roomTypeWrap = document.getElementById('room-type-wrap');
  const roomTypeSelect = document.getElementById('room-type');
  const pricePerNightLabel = document.getElementById('price-per-night');
  const nightsCountLabel = document.getElementById('nights-count');
  const totalWrap = document.getElementById('total-wrap');
  const totalPriceLabel = document.getElementById('total-price');

  if (accomSelect) {
    accommodations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name + ' — ' + loc.region;
      accomSelect.appendChild(opt);
    });

    accomSelect.addEventListener('change', () => {
      const id = accomSelect.value;
      const loc = accommodations.find(a => a.id === id);
      if (!loc) return;
      // Populate room types (or fallback to base price)
      roomTypeSelect.innerHTML = '';
      if (Array.isArray(loc.roomTypes) && loc.roomTypes.length) {
        loc.roomTypes.forEach(rt => {
          const o = document.createElement('option');
          o.value = rt.id;
          o.textContent = `${rt.name} — €${rt.price} / noapte (${rt.capacity} pers)`;
          o.dataset.price = rt.price;
          o.dataset.capacity = rt.capacity;
          roomTypeSelect.appendChild(o);
        });
        roomTypeWrap.style.display = '';
        totalWrap.style.display = '';
        updatePriceAndTotal();
      } else {
        // parse price from loc.price (string like '€120 / noapte')
        const p = String(loc.price || '').match(/([0-9,.]+)/);
        const base = p ? Number(p[1].replace(',', '.')) : 0;
        roomTypeWrap.style.display = 'none';
        totalWrap.style.display = '';
        pricePerNightLabel.textContent = `Preț: €${base} / noapte`;
        updatePriceAndTotal();
      }
    });
  }

    // Open booking form prefilled for a given accommodation id
    function openBookingFor(id) {
      const bookingSection = document.getElementById('booking');
      const accom = document.getElementById('accommodation');
      const form = document.getElementById('booking-form');
      const successEl = document.getElementById('form-success');
      if (accom) {
        accom.value = id;
        accom.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // show form and hide success state
      if (form) { form.style.display = ''; form.classList.remove('disabled'); }
      if (successEl) successEl.classList.remove('active');

      // choose first room type if available and recalc
      const rt = document.getElementById('room-type');
      if (rt && rt.options.length) { rt.selectedIndex = 0; }
      if (typeof updatePriceAndTotal === 'function') updatePriceAndTotal();

      // scroll to booking and focus first input
      if (bookingSection) {
        setTimeout(() => {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const fname = document.getElementById('fname');
          if (fname) fname.focus();
        }, 150);
      }
    }

  // Price & total update helper (reads form inputs and computes total)
  function updatePriceAndTotal() {
    const accomId = accomSelect?.value;
    const roomId = roomTypeSelect?.value;
    const checkinEl = document.getElementById('checkin');
    const checkoutEl = document.getElementById('checkout');
    const guestsEl = document.getElementById('guests');

    if (!accomId || !roomId) {
      pricePerNightLabel.textContent = 'Preț: -';
      nightsCountLabel.textContent = 'Nopți: -';
      totalPriceLabel.textContent = '-';
      return;
    }

    const loc = accommodations.find(a => a.id === accomId);
    const room = loc && loc.roomTypes ? loc.roomTypes.find(r => r.id === roomId) : null;
    const price = room ? Number(room.price) : (loc && loc.price ? parseFloat(String(loc.price).replace(/[^0-9.]/g, '')) : 0);

    // compute nights
    let nights = 1;
    if (checkinEl && checkoutEl && checkinEl.value && checkoutEl.value) {
      const d1 = new Date(checkinEl.value);
      const d2 = new Date(checkoutEl.value);
      const ms = d2 - d1;
      nights = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    }

    const guests = guestsEl ? Number(guestsEl.value) || 1 : 1;
    const total = (price * nights);

    pricePerNightLabel.textContent = `Preț: €${price} / noapte`;
    nightsCountLabel.textContent = `Nopți: ${nights}`;
    totalPriceLabel.textContent = `€${total.toFixed(2)}`;
  }

  // Attach listeners so UI updates when dates/guests/room change
  document.addEventListener('change', (e) => {
    const ids = ['checkin','checkout','guests','room-type','accommodation'];
    if (ids.includes(e.target?.id)) updatePriceAndTotal();
  });

  detailClose?.addEventListener('click', closeDetails);
  detailCloseBtn?.addEventListener('click', closeDetails);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !detailPanel.classList.contains('hidden')) {
      closeDetails();
    }
  });
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

  const API_BASE = '';
  const tokenKey = 'gorjBookingToken';
  const authModal = document.getElementById('auth-modal');
  const modalLoginForm = document.getElementById('modal-login-form');
  const modalRegisterForm = document.getElementById('modal-register-form');
  const modalAuthTabs = document.querySelectorAll('#auth-modal .account-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const accountPanel = document.getElementById('account-panel');
  const accountName = document.getElementById('account-name');
  const reservationList = document.getElementById('reservation-list');
  const reservationCount = document.getElementById('account-reservation-count');
  const guestNote = document.getElementById('guest-note');
  const authTabs = document.querySelectorAll('.account-widget .account-tab');
  const accountButton = document.getElementById('account-button');
  const accountWidgetWrapper = document.getElementById('account-widget-wrapper');
  const logoutBtn = document.getElementById('logout-btn');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const registerName = document.getElementById('register-name');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');
  const registerPasswordConfirm = document.getElementById('register-password-confirm');
  const bookingEmail = document.getElementById('email');

  function getToken() {
    return localStorage.getItem(tokenKey);
  }

  function setToken(token) {
    localStorage.setItem(tokenKey, token);
  }

  function clearToken() {
    localStorage.removeItem(tokenKey);
  }

  function showAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('hidden');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function hideAuthModal() {
    if (!authModal) return;
    authModal.classList.add('hidden');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw data;
    }
    return data;
  }

  async function fetchProfile() {
    const token = getToken();
    if (!token) return null;
    const profiles = JSON.parse(localStorage.getItem('gorjLocalProfiles') || '{}');
    if (profiles[token]) {
      return { user: profiles[token] };
    }
    // Fallback to backend profile if local profile missing
    try {
      return await apiFetch('/api/profile');
    } catch (error) {
      clearToken();
      return null;
    }
  }

  async function fetchReservations() {
    const token = getToken();
    const bookings = JSON.parse(localStorage.getItem('gorjLocalBookings') || '[]');
    const userBookings = bookings.filter(b => b.ownerToken === token);
    if (userBookings.length) return userBookings;
    // Fallback to backend bookings if no local bookings found
    try {
      const result = await apiFetch('/api/bookings');
      return result.bookings || [];
    } catch (error) {
      return userBookings;
    }
  }

  function stableTokenForEmail(email) {
    return 'local-' + email.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  async function loginUser(email, password) {
    // Local first: validate against saved users
    const users = JSON.parse(localStorage.getItem('gorjLocalUsers') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) {
      // try backend if local not found
      try {
        return await apiFetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      } catch (err) {
        throw { error: 'Utilizator inexistent. Creează un cont.' };
      }
    }
    if (user.password !== password) throw { error: 'Parolă incorectă.' };
    const token = stableTokenForEmail(email);
    const profiles = JSON.parse(localStorage.getItem('gorjLocalProfiles') || '{}');
    profiles[token] = { name: user.name, email: user.email };
    localStorage.setItem('gorjLocalProfiles', JSON.stringify(profiles));
    return { token, user: { name: user.name, email: user.email } };
  }

  async function registerUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('gorjLocalUsers') || '[]');
    if (users.find(u => u.email === email)) {
      throw { error: 'Email deja folosit.' };
    }
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('gorjLocalUsers', JSON.stringify(users));
    const token = stableTokenForEmail(email);
    const profiles = JSON.parse(localStorage.getItem('gorjLocalProfiles') || '{}');
    profiles[token] = { name, email };
    localStorage.setItem('gorjLocalProfiles', JSON.stringify(profiles));
    return { token, user: { name, email } };
  }

  async function createBooking(bookingData) {
    const token = getToken();
    const ownerToken = token || null;
    const item = Object.assign({}, bookingData, {
      createdAt: new Date().toISOString(),
      id: 'local-booking-' + Date.now(),
      ownerToken
    });
    const key = 'gorjLocalBookings';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(item);
    localStorage.setItem(key, JSON.stringify(existing));
    try {
      const bookings = existing.filter(b => b.ownerToken === ownerToken);
      renderReservations(bookings);
    } catch (e) { /* ignore */ }
    return { ok: true, booking: item };
  }

  function setVisibleTab(tab) {
    authTabs.forEach(button => {
      const isActive = button.dataset.tab === tab;
      button.classList.toggle('active', isActive);
    });

    if (loginForm && registerForm) {
      loginForm.classList.toggle('hidden', tab !== 'login');
      registerForm.classList.toggle('hidden', tab !== 'register');
    }
  }

  authTabs.forEach(button => {
    button.addEventListener('click', () => {
      setVisibleTab(button.dataset.tab);
    });
  });

  function refreshAccountButton(profile) {
    if (!accountButton) return;
    if (profile?.user) {
      accountButton.textContent = profile.user.name;
    } else {
      accountButton.textContent = 'Cont';
    }
  }

  accountButton?.addEventListener('click', async () => {
    const profile = await fetchProfile();
    if (profile?.user) {
      refreshAccountButton(profile);
      if (!accountWidgetWrapper) return;
      accountWidgetWrapper.classList.toggle('hidden');
      if (!accountWidgetWrapper.classList.contains('hidden')) {
        accountPanel?.classList.remove('hidden');
      }
    } else {
      if (accountWidgetWrapper) accountWidgetWrapper.classList.add('hidden');
      showAuthModal();
    }
  });

  // Modal tab switching
  modalAuthTabs.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      modalAuthTabs.forEach(b => b.classList.toggle('active', b === button));
      if (modalLoginForm && modalRegisterForm) {
        modalLoginForm.classList.toggle('hidden', tab !== 'modal-login');
        modalRegisterForm.classList.toggle('hidden', tab !== 'modal-register');
      }
    });
  });

  // Modal form submits (use same API helpers)
  modalLoginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('modal-login-email')?.value.trim().toLowerCase();
    const password = document.getElementById('modal-login-password')?.value || '';
    if (!email || !password) return;
    try {
      const res = await loginUser(email, password);
      setToken(res.token);
      await updateAuthUI();
      hideAuthModal();
    } catch (err) {
      // show inline feedback
      const f = document.getElementById('modal-login-email');
      if (f) showAuthError(err?.error || 'Date incorecte. Verifică email-ul și parola.', f);
    }
  });

  modalRegisterForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('modal-register-name')?.value.trim();
    const email = document.getElementById('modal-register-email')?.value.trim().toLowerCase();
    const password = document.getElementById('modal-register-password')?.value || '';
    const confirm = document.getElementById('modal-register-password-confirm')?.value || '';
    if (!name || !email || !password || !confirm) return showAuthError('Completează toate câmpurile.', document.getElementById('modal-register-name'));
    if (password !== confirm) return showAuthError('Parolele nu coincid.', document.getElementById('modal-register-password'));
    try {
      const res = await registerUser(name, email, password);
      setToken(res.token);
      await updateAuthUI();
      hideAuthModal();
    } catch (err) {
      showAuthError(err?.error || 'Nu s-a putut crea contul.', document.getElementById('modal-register-email'));
    }
  });

  function renderReservations(bookings) {
    if (!reservationList) return;

    reservationList.innerHTML = '';
    if (!bookings.length) {
      reservationList.innerHTML = '<p class="reservation-empty">Nu există rezervări salvate.</p>';
      return;
    }

    bookings.slice().reverse().forEach(item => {
      const card = document.createElement('div');
      card.className = 'reservation-card';
      const accomName = (window.GORJ_ACCOMMODATIONS || []).find(a => a.id === item.accommodation)?.name || item.accommodation || 'Cazare';
      card.innerHTML = `
        <h5>${accomName}</h5>
        <p><strong>Perioadă:</strong> ${item.checkin} – ${item.checkout}</p>
        <p><strong>Persoane:</strong> ${item.guests}</p>
        <p><strong>Înregistrat:</strong> ${new Date(item.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p>${item.message ? `Notă: ${item.message}` : 'Fără cerințe speciale.'}</p>
      `;
      reservationList.appendChild(card);
    });
  }

  async function updateAuthUI() {
    const profile = await fetchProfile();
    refreshAccountButton(profile);
    if (profile?.user) {
      // hide auth modal when logged in
      try { hideAuthModal(); } catch (e) { }
      if (accountPanel) accountPanel.classList.remove('hidden');
      if (accountName) accountName.textContent = profile.user.name;
      const bookings = await fetchReservations();
      if (reservationCount) reservationCount.textContent = bookings.length;
      renderReservations(bookings);
      if (submitBtn) submitBtn.disabled = false;
      if (form) form.classList.remove('disabled');
      if (guestNote) guestNote.textContent = 'Rezervările tale vor fi salvate în profilul tău.';
      if (bookingEmail) {
        bookingEmail.value = profile.user.email;
        bookingEmail.disabled = true;
      }
      refreshAccountButton(profile);
      return;
    }

    if (accountPanel) accountPanel.classList.add('hidden');
    if (accountWidgetWrapper) accountWidgetWrapper.classList.add('hidden');
    refreshAccountButton(null);
    setVisibleTab('login');
    // show auth modal when not logged in
    try { showAuthModal(); } catch (e) { }
    if (submitBtn) submitBtn.disabled = true;
    if (form) form.classList.add('disabled');
    if (guestNote) guestNote.textContent = 'Te autentifici sau înregistrezi pentru a salva rezervările în profilul tău.';
    if (bookingEmail) {
      bookingEmail.value = '';
      bookingEmail.disabled = false;
    }
  }

  function showAuthError(message, field) {
    if (guestNote) guestNote.textContent = message;
    if (field) {
      gsap.to(field, {
        borderColor: '#e74c3c',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.to(field, { borderColor: 'rgba(201,168,76,0.2)', duration: 0.3 })
      });
      gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    }
  }

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginEmail?.value.trim().toLowerCase();
    const password = loginPassword?.value || '';
    if (!email || !password) {
      showAuthError('Completează email și parolă.', loginEmail || loginPassword);
      return;
    }

    try {
      const result = await loginUser(email, password);
      setToken(result.token);
      await updateAuthUI();
    } catch (error) {
      showAuthError(error?.error || 'Date incorecte. Verifică email-ul și parola.', loginEmail);
    }
  });

  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = registerName?.value.trim();
    const email = registerEmail?.value.trim().toLowerCase();
    const password = registerPassword?.value || '';
    const confirm = registerPasswordConfirm?.value || '';

    if (!name || !email || !password || !confirm) {
      showAuthError('Completează toate câmpurile.', registerName || registerEmail);
      return;
    }
    if (password !== confirm) {
      showAuthError('Parolele nu coincid.', registerPassword);
      return;
    }

    try {
      const result = await registerUser(name, email, password);
      setToken(result.token);
      await updateAuthUI();
    } catch (error) {
      showAuthError(error?.error || 'Nu s-a putut crea contul.', registerEmail);
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    clearToken();
    await updateAuthUI();
  });

  updateAuthUI();

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

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      showAuthError('Trebuie să fii autentificat pentru a trimite rezervarea.', loginEmail || loginPassword);
      setVisibleTab('login');
      return;
    }

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

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const bookingData = {
      firstName: document.getElementById('fname')?.value.trim(),
      lastName: document.getElementById('lname')?.value.trim(),
      email: bookingEmail?.value.trim(),
      accommodation: document.getElementById('accommodation')?.value,
      checkin: document.getElementById('checkin')?.value,
      checkout: document.getElementById('checkout')?.value,
      guests: document.getElementById('guests')?.value,
      message: document.getElementById('message')?.value.trim(),
      roomType: document.getElementById('room-type')?.value || null,
      pricePerNight: (function(){
        const rp = document.getElementById('price-per-night')?.textContent || '';
        const m = rp.match(/€([0-9,.]+)/);
        return m ? Number(m[1].replace(',', '.')) : null;
      })(),
      nights: (function(){
        const ci = document.getElementById('checkin')?.value;
        const co = document.getElementById('checkout')?.value;
        if (!ci || !co) return 1;
        return Math.max(1, Math.round((new Date(co) - new Date(ci)) / (1000*60*60*24)));
      })(),
      totalPrice: (function(){
        const p = (document.getElementById('price-per-night')?.textContent || '').match(/€([0-9,.]+)/);
        const nights = (function(){ const ci=document.getElementById('checkin')?.value; const co=document.getElementById('checkout')?.value; if(!ci||!co) return 1; return Math.max(1, Math.round((new Date(co)-new Date(ci))/(1000*60*60*24))); })();
        return p ? Number(p[1].replace(',', '.')) * nights : null;
      })()
    };

    try {
      await createBooking(bookingData);
      await updateAuthUI();

      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          form.style.display = 'none';
          success.classList.add('active');
          createConfetti();
          gsap.fromTo(success,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'elastic.out(0.6, 0.6)' }
          );
          gsap.fromTo('.success-icon',
            { scale: 0, rotation: -180 },
            { scale: 1, rotation: 0, duration: 0.8, delay: 0.1, ease: 'elastic.out(0.8, 0.8)' }
          );
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
    } catch (error) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      showAuthError(error?.error || 'Nu s-a putut salva rezervarea. Reîncearcă.', bookingEmail);
    }
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

// ── 10. DESTINATION GUIDE OPTION ───────────────────────────────
(function initDestinationGuideOption() {
  document.querySelectorAll('.guide-btn').forEach(button => {
    const basePrice = Number(button.dataset.basePrice) || 0;
    const guidePrice = Number(button.dataset.guidePrice) || 30;
    const originalText = button.textContent.trim();

    button.addEventListener('click', event => {
      event.stopPropagation();
      const active = button.classList.toggle('active');
      const total = basePrice + (active ? guidePrice : 0);
      button.textContent = active ? `Ghid adăugat +€${guidePrice}` : originalText;

      const card = button.closest('.dest-card');
      if (!card) return;
      const meta = card.querySelector('.dest-meta');
      if (!meta) return;
      const priceLabel = meta.querySelector('.dest-price');
      if (priceLabel) {
        priceLabel.textContent = `de la €${total}`;
      } else {
        const span = document.createElement('span');
        span.className = 'dest-price';
        span.textContent = `de la €${total}`;
        meta.appendChild(span);
      }
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
