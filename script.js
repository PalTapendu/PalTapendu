/* ============================================================
   1. Mouse-reactive particle background
   ============================================================ */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
const mouse = { x: -9999, y: -9999, active: false };
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const density = Math.min(90, Math.floor((W * H) / 16000));
  particles = Array.from({ length: density }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6
  }));
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
});
window.addEventListener('mouseleave', () => { mouse.active = false; });
window.addEventListener('touchmove', e => {
  if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
}, { passive: true });

const LINK_DIST = 130;
const MOUSE_DIST = 170;

function tick() {
  ctx.clearRect(0, 0, W, H);

  const g = ctx.createRadialGradient(W * 0.8, H * 0.05, 0, W * 0.8, H * 0.05, Math.max(W, H) * 0.9);
  g.addColorStop(0, 'rgba(201,162,75,0.05)');
  g.addColorStop(1, 'rgba(10,15,28,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  for (let p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    if (mouse.active) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST && dist > 0) {
        const force = (MOUSE_DIST - dist) / MOUSE_DIST;
        p.x += (dx / dist) * force * 1.1;
        p.y += (dy / dist) * force * 1.1;
      }
    }
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_DIST) {
        ctx.strokeStyle = `rgba(139,147,169,${0.12 * (1 - dist / LINK_DIST)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    if (mouse.active) {
      const a = particles[i];
      const dx = a.x - mouse.x, dy = a.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST) {
        ctx.strokeStyle = `rgba(201,162,75,${0.28 * (1 - dist / MOUSE_DIST)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234,237,244,0.55)';
    ctx.fill();
  }

  if (!prefersReduced) requestAnimationFrame(tick);
}
if (prefersReduced) {
  ctx.fillStyle = '#0A0F1C';
  ctx.fillRect(0, 0, W, H);
} else {
  requestAnimationFrame(tick);
}

/* ============================================================
   2. Hero terminal typing animation — replays every time the
      console box scrolls into view (down, up, or tab-return)
   ============================================================ */
const assertions = [
  "booting profile...",
  ["Engineer with 2+ years building & testing software"],
  ["Daily stack: GitHub Copilot, ChatGPT, Claude"],
  ["Exploring: Prompt Engineering, AI-assisted builds"],
  ["Currently shipping personal AI-powered projects"],
  ["Status: curious, caffeinated, building"]
];
const consoleBody = document.getElementById('consoleBody');
const consoleBox = document.getElementById('consoleBox');

let consoleRunId = 0; // bumping this invalidates any in-flight typing callbacks

function typeLine(text, isAssertion, cb, runId) {
  const line = document.createElement('div');
  line.className = 'console-line';
  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.textContent = isAssertion ? '…' : '$';
  const txt = document.createElement('span');
  line.appendChild(mark); line.appendChild(txt);
  consoleBody.appendChild(line);
  requestAnimationFrame(() => { if (runId === consoleRunId) line.style.transition = 'opacity .3s ease'; });
  line.style.opacity = 1;

  let i = 0;
  const speed = 16;
  function step() {
    if (runId !== consoleRunId) return; // a newer run has started — abandon this one
    if (i <= text.length) {
      txt.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else {
      if (isAssertion) { line.classList.add('passed'); mark.textContent = '✓'; }
      if (cb) setTimeout(() => { if (runId === consoleRunId) cb(); }, 160);
    }
  }
  step();
}

function runConsoleSuite() {
  consoleRunId++;
  const runId = consoleRunId;
  consoleBody.innerHTML = '';
  let i = 0;
  function next() {
    if (runId !== consoleRunId) return;
    if (i >= assertions.length) {
      const summary = document.createElement('div');
      summary.className = 'console-summary';
      summary.innerHTML = '5 passed, 0 failed <span class="cursor-blink"></span>';
      consoleBody.appendChild(summary);
      requestAnimationFrame(() => {
        if (runId !== consoleRunId) return;
        summary.style.transition = 'opacity .5s ease';
        summary.style.opacity = 1;
      });
      return;
    }
    const item = assertions[i];
    const isAssertion = Array.isArray(item);
    typeLine(isAssertion ? item[0] : item, isAssertion, () => {
      i++;
      setTimeout(() => { if (runId === consoleRunId) next(); }, 120);
    }, runId);
  }
  next();
}

const consoleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) runConsoleSuite();
  });
}, { threshold: 0.45 });
consoleObserver.observe(consoleBox);

/* ============================================================
   3. Scroll progress bar + back-to-top button
   ============================================================ */
const progress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');
function onScroll() {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
  toTop.classList.toggle('show', h.scrollTop > 600);
}
document.addEventListener('scroll', onScroll, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   4. Two-way scroll reveal — sections animate in on the way
      down AND replay (from the opposite side) on the way back up
   ============================================================ */
let lastScrollY = window.scrollY;
let scrollDirection = 'down';
function trackDirection() {
  const y = window.scrollY;
  if (y > lastScrollY) scrollDirection = 'down';
  else if (y < lastScrollY) scrollDirection = 'up';
  lastScrollY = y;
}
window.addEventListener('scroll', trackDirection, { passive: true });

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.toggle('reveal-up', scrollDirection === 'up');
      void el.offsetWidth; // force reflow so the offset direction applies before animating in
      el.classList.add('in');
    } else {
      el.classList.remove('in');
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   5. Scrollspy — highlight the active nav link
   ============================================================ */
const sections = ['about', 'skills', 'projects', 'experience', 'contact']
  .map(id => document.getElementById(id));
const navLinks = document.querySelectorAll('.navlinks a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => s && spy.observe(s));
