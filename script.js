const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   0. Loader
   ============================================================ */
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
let loadPct = 0;
const loadTimer = setInterval(() => {
  loadPct += Math.random() * 18;
  if (loadPct >= 100) {
    loadPct = 100;
    loaderFill.style.width = '100%';
    clearInterval(loadTimer);
    setTimeout(() => loader.classList.add('hide'), 250);
  } else {
    loaderFill.style.width = loadPct + '%';
  }
}, 120);

/* ============================================================
   1. Mouse-reactive multi-tint particle network + click ripples
   ============================================================ */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], ripples = [];
const mouse = { x: -9999, y: -9999, active: false };

const PARTICLE_COLORS = [
  'rgba(201, 162, 75, 0.85)',  // Gold
  'rgba(0, 194, 168, 0.85)',   // Cyan
  'rgba(116, 217, 174, 0.85)',  // Mint
  'rgba(234, 237, 244, 0.75)',  // Silver
  'rgba(139, 124, 240, 0.8)'   // Purple
];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const density = Math.min(80, Math.floor((W * H) / 17000));
  particles = Array.from({ length: density }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
  }));
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
window.addEventListener('mouseleave', () => { mouse.active = false; });
window.addEventListener('touchmove', e => {
  if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
}, { passive: true });

// Interactive shockwave ripple on click
window.addEventListener('click', e => {
  if (ripples.length < 8) {
    ripples.push({ x: e.clientX, y: e.clientY, r: 2, maxR: 90, opacity: 0.55 });
  }
});

const LINK_DIST = 120, MOUSE_DIST = 175;

function tickCanvas() {
  ctx.clearRect(0, 0, W, H);

  // Render & update shockwave ripples
  for (let k = ripples.length - 1; k >= 0; k--) {
    const rip = ripples[k];
    rip.r += 3.2;
    rip.opacity *= 0.94;
    if (rip.r >= rip.maxR || rip.opacity < 0.02) {
      ripples.splice(k, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(201, 162, 75, ${rip.opacity})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // Update particles
  for (let p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    // Repel or magnetize to mouse
    if (mouse.active) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < MOUSE_DIST && dist > 0) {
        const f = (MOUSE_DIST - dist) / MOUSE_DIST;
        p.x += (dx / dist) * f * 1.1;
        p.y += (dy / dist) * f * 1.1;
      }
    }
  }

  // Draw connecting constellation lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
      if (dist < LINK_DIST) {
        ctx.strokeStyle = `rgba(139,147,169,${0.12 * (1 - dist / LINK_DIST)})`;
        ctx.lineWidth = 0.85;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (mouse.active) {
      const a = particles[i];
      const dx = a.x - mouse.x, dy = a.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < MOUSE_DIST) {
        ctx.strokeStyle = `rgba(201,162,75,${0.28 * (1 - dist / MOUSE_DIST)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  }

  // Draw particle nodes
  for (let p of particles) {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (!prefersReduced) requestAnimationFrame(tickCanvas);
}
if (prefersReduced) { ctx.fillStyle = '#0A0F1C'; ctx.fillRect(0, 0, W, H); }
else { requestAnimationFrame(tickCanvas); }

/* ============================================================
   2. Aurora blobs — parallax drift with mouse + slow float
   ============================================================ */
const blobs = document.querySelectorAll('.blob');
const blobFactors = [0.018, -0.024, 0.02];
let bt = 0;
function blobLoop() {
  bt += 0.004;
  blobs.forEach((b, i) => {
    const floatX = Math.sin(bt + i * 2) * 26;
    const floatY = Math.cos(bt * 0.8 + i * 2) * 26;
    const parX = (mouse.x - innerWidth / 2 || 0) * blobFactors[i];
    const parY = (mouse.y - innerHeight / 2 || 0) * blobFactors[i];
    b.style.transform = `translate(${floatX + parX}px, ${floatY + parY}px)`;
  });
  if (!prefersReduced) requestAnimationFrame(blobLoop);
}
blobLoop();

/* ============================================================
   3. Kinetic hero headline entrance & interactive glint
   ============================================================ */
const heroBadge = document.querySelector('.hero-badge');
if (heroBadge) {
  heroBadge.style.opacity = '0';
  heroBadge.style.transform = 'translateY(12px)';
  heroBadge.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  setTimeout(() => {
    heroBadge.style.opacity = '1';
    heroBadge.style.transform = 'translateY(0)';
  }, 300);
}

const heroHeadline = document.getElementById('heroHeadline');
if (heroHeadline) {
  const line1 = heroHeadline.querySelector('.hero-line-1');
  const line2 = heroHeadline.querySelector('.hero-line-2');
  if (line1) {
    line1.style.opacity = '0';
    line1.style.transform = 'translateY(18px)';
    line1.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      line1.style.opacity = '1';
      line1.style.transform = 'translateY(0)';
    }, 450);
  }
  if (line2) {
    line2.style.opacity = '0';
    line2.style.transform = 'translateY(18px)';
    line2.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      line2.style.opacity = '1';
      line2.style.transform = 'translateY(0)';
    }, 600);
  }
}

/* ============================================================
   4. Re-triggering terminal typing animation
   ============================================================ */
const assertions = [
  "booting autonomous profile...",
  ["Engineer with 2.5+ years building & testing software at scale"],
  ["Daily AI stack: GitHub Copilot, ChatGPT, Claude 3.7"],
  ["Core expertise: Selenium, Playwright, Enterprise Automation"],
  ["Currently shipping personal AI-powered full-stack projects"],
  ["Status: online, caffeinated, building 🚀"]
];
const consoleBody = document.getElementById('consoleBody');
const consoleBox = document.getElementById('consoleBox');
let consoleRunId = 0;

function typeLine(text, isAssertion, cb, runId) {
  const line = document.createElement('div');
  line.className = 'console-line';
  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.textContent = isAssertion ? '>' : '$';
  const txt = document.createElement('span');
  line.appendChild(mark); line.appendChild(txt);
  consoleBody.appendChild(line);
  requestAnimationFrame(() => { if (runId === consoleRunId) line.style.transition = 'opacity .3s ease'; });
  line.style.opacity = 1;
  let i = 0; const speed = 16;
  function step() {
    if (runId !== consoleRunId) return;
    if (i <= text.length) { txt.textContent = text.slice(0, i); i++; setTimeout(step, speed); }
    else {
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
      i++; setTimeout(() => { if (runId === consoleRunId) next(); }, 120);
    }, runId);
  }
  next();
}
new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) runConsoleSuite(); });
}, { threshold: 0.45 }).observe(consoleBox);

/* ============================================================
   5. Animated stat counters & Live Dynamic Tenure Engine
   ============================================================ */
// Real-time dynamic Cognizant experience calculator (Start Date: June 6, 2024)
const COGNIZANT_JOIN_DATE = new Date(2024, 5, 6, 0, 0, 0); // June 6, 2024

function updateLiveCognizantTenure() {
  const now = new Date();
  const displayEl = document.getElementById('liveTenureDisplay');
  const clockEl = document.getElementById('liveTenureClock');
  if (!displayEl && !clockEl) return;

  let years = now.getFullYear() - COGNIZANT_JOIN_DATE.getFullYear();
  let months = now.getMonth() - COGNIZANT_JOIN_DATE.getMonth();
  let days = now.getDate() - COGNIZANT_JOIN_DATE.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const parts = [];
  if (years > 0) parts.push(years === 1 ? '1 Yr' : `${years} Yrs`);
  parts.push(months === 1 ? '1 Mo' : `${months} Mos`);
  parts.push(days === 1 ? '1 Day' : `${days} Days`);

  if (displayEl) {
    displayEl.textContent = parts.join(', ');
  }
  if (clockEl) {
    clockEl.textContent = `· ${hours}:${minutes}:${seconds}`;
  }
}

// Run immediately and update every second
updateLiveCognizantTenure();
setInterval(updateLiveCognizantTenure, 1000);

// Stat Number Counting Animations
document.querySelectorAll('[data-count], [data-count-float]').forEach(el => {
  const isFloat = el.hasAttribute('data-count-float');
  const target = isFloat
    ? parseFloat(el.getAttribute('data-count-float'))
    : parseInt(el.getAttribute('data-count'), 10);

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let start = null;
        const duration = 1200;
        function step(ts) {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const easeOut = 1 - Math.pow(1 - p, 3); // Cubic ease out
          const current = easeOut * target;
          el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = isFloat ? target.toFixed(1) : target;
        }
        requestAnimationFrame(step);
      } else {
        el.textContent = isFloat ? '0.0' : '0';
      }
    });
  }, { threshold: 0.35 });
  io.observe(el);
});

// Interactive Flip Card Mobile / Keyboard Toggles
const statFlippers = document.querySelectorAll('.stat-flipper');
statFlippers.forEach(card => {
  // Mobile / Touch click toggle
  card.addEventListener('click', (e) => {
    // If click is not inside a link or button, toggle
    if (window.matchMedia('(hover: none)').matches || window.innerWidth <= 1024) {
      const isCurrentlyFlipped = card.classList.contains('is-flipped');
      // Unflip other cards
      statFlippers.forEach(other => { if (other !== card) other.classList.remove('is-flipped'); });
      card.classList.toggle('is-flipped', !isCurrentlyFlipped);
    }
  });

  // Keyboard accessibility
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('is-flipped');
    }
  });
});

/* ============================================================
   6. Scroll progress + back to top
   ============================================================ */
const progress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');
document.addEventListener('scroll', () => {
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  toTop.classList.toggle('show', h.scrollTop > 600);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   7. Two-way scroll reveal
   ============================================================ */
let lastY = window.scrollY, dir = 'down';
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  dir = y > lastY ? 'down' : (y < lastY ? 'up' : dir);
  lastY = y;
}, { passive: true });
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.toggle('reveal-up', dir === 'up');
      void el.offsetWidth;
      el.classList.add('in');
    } else {
      el.classList.remove('in');
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* ============================================================
   8. 3D Tilt & Spotlight-glow cursor tracking on cards
   ============================================================ */
document.querySelectorAll('.glow-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    card.style.setProperty('--mx', (x / r.width * 100) + '%');
    card.style.setProperty('--my', (y / r.height * 100) + '%');

    // Subtle 3D perspective tilt
    const centerX = r.width / 2;
    const centerY = r.height / 2;
    const rotX = ((y - centerY) / centerY) * -3.8;
    const rotY = ((x - centerX) / centerX) * 3.8;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
});

/* ============================================================
   8b. Interactive Spotlight Torch Tracking on Section Titles
   ============================================================ */
const torchTitles = document.querySelectorAll('.section-head h2, .contact-card h2');

function updateTorchPositions(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  torchTitles.forEach(title => {
    const rect = title.getBoundingClientRect();
    if (rect.bottom >= -50 && rect.top <= window.innerHeight + 50) {
      const relX = mouseX - rect.left;
      const relY = mouseY - rect.top;
      title.style.setProperty('--hx', `${relX.toFixed(1)}px`);
      title.style.setProperty('--hy', `${relY.toFixed(1)}px`);
    }
  });
}

window.addEventListener('mousemove', updateTorchPositions, { passive: true });
window.addEventListener('touchmove', e => {
  if (e.touches[0]) updateTorchPositions(e.touches[0]);
}, { passive: true });

// Initial gentle sweep animation on viewport entrance
const torchIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const title = entry.target;
      const rect = title.getBoundingClientRect();
      let sweepX = -120;
      const maxSweep = rect.width + 120;
      function introSweep() {
        sweepX += (maxSweep - sweepX) * 0.07;
        title.style.setProperty('--hx', `${sweepX.toFixed(1)}px`);
        title.style.setProperty('--hy', `${(rect.height / 2).toFixed(1)}px`);
        if (sweepX < maxSweep - 4) {
          requestAnimationFrame(introSweep);
        }
      }
      introSweep();
    }
  });
}, { threshold: 0.3 });

torchTitles.forEach(h => torchIO.observe(h));

/* ============================================================
   9. Fluid Magnetic buttons/links with spring physics
   ============================================================ */
document.querySelectorAll('.magnetic, .btn-primary, .btn-ghost, .navcta').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width / 2;
    const relY = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${relX * 0.22}px, ${relY * 0.28}px) scale(1.03)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0,0) scale(1)';
  });
});

/* ============================================================
   10. Scrollspy nav
   ============================================================ */
const sections = ['about', 'skills', 'projects', 'experience', 'contact'].map(id => document.getElementById(id));
const navA = document.querySelectorAll('.navlinks a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => s && spy.observe(s));

/* ============================================================
   11. Dynamic Project modal
   ============================================================ */
const projectData = {
  'fb-extension': {
    file: 'ai-facebook-auto-reply.md',
    title: 'AI-Powered Facebook Auto-Reply Extension',
    body: 'An intelligent Chrome Extension with integrated backend AI APIs. When active, it scans and reads incoming comments on Facebook posts, understands the contextual intent, sentiment, and tone, and leverages backend AI API calls to generate personalized, human-like automated responses with seamless execution.',
    tags: ['Chrome Extension', 'AI API Integration', 'Contextual LLM', 'Automation', 'JavaScript']
  },
  'test-recorder': {
    file: 'ai-test-script-recorder.md',
    title: 'AI Test Script Recorder & Code Generator',
    body: 'A smart Chrome Extension that records user browser interactions in real-time. It synthesizes reliable XPaths, CSS locators, and action flows, then leverages backend AI to output production-ready test automation scripts in Playwright, Selenium, Java, Python, and JavaScript.',
    tags: ['Chrome Extension', 'Playwright', 'Selenium', 'AI CodeGen', 'XPath Synthesis']
  },
  'qa-agent': {
    file: 'autonomous-qa-agent.md',
    title: 'Autonomous Self-Healing QA Agent Pipeline',
    body: 'An advanced agentic AI system currently under active development. Designed to autonomously execute test suites, detect broken UI locators, synthesize self-healing repairs on the fly, and perform multi-modal root-cause analysis.',
    tags: ['In Progress', 'Autonomous Agent', 'Self-Healing Locators', 'AI Pipeline']
  }
};

const overlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.proj-card[data-project]').forEach(card => {
  card.addEventListener('click', () => {
    const pKey = card.getAttribute('data-project');
    const data = projectData[pKey];
    if (data && overlay) {
      const barSpan = overlay.querySelector('.modal-bar .mono');
      const bodyH3 = overlay.querySelector('.modal-body h3');
      const bodyP = overlay.querySelector('.modal-body p');
      const tagRow = overlay.querySelector('.modal-body .tag-row');

      if (barSpan) barSpan.textContent = data.file;
      if (bodyH3) bodyH3.textContent = data.title;
      if (bodyP) bodyP.textContent = data.body;
      if (tagRow) {
        tagRow.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');
      }
    }
    overlay.classList.add('show');
  });
});

function closeModal() { overlay.classList.remove('show'); }
if (modalClose) modalClose.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay) closeModal(); });

/* ============================================================
   12. Blur-in reveal for skills big-tile lines (distinct from
       the hero terminal typing effect) — staggered, two-way
   ============================================================ */
const blurLines = document.querySelectorAll('.blur-line');
const aiTile = document.getElementById('aiTile');
if (aiTile && blurLines.length) {
  const blurIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        blurLines.forEach((line, i) => setTimeout(() => line.classList.add('in'), i * 160));
      } else {
        blurLines.forEach(line => line.classList.remove('in'));
      }
    });
  }, { threshold: 0.4 });
  blurIO.observe(aiTile);
}

/* ============================================================
   13. Interactive coder illustration
       - Single seated developer at his workstation
       - Idle State: Head facing screen (#headCoding), typing away with code streaming
       - Active Cursor: Head turns forward (#headTurned), typing pauses, both eyes track cursor in real time
       - Inactivity Timeout (~2.4s stationary cursor in card):
         Pops up "Please, let me do my work!", turns head back to screen, and resumes coding!
       - Moving Cursor Again: Resumes watching the cursor
       - Click: Angry shake & speech reaction
   ============================================================ */
const illusTile = document.getElementById('illusTile');
const headTurned = document.getElementById('headTurned');
const pupilLeft = document.getElementById('pupilLeft');
const pupilRight = document.getElementById('pupilRight');
const speechText = document.getElementById('speechText');
const statusLabel = document.getElementById('statusLabel');

const angryReactions = [
  "Please let me finish my work!",
  "Hey! Let me finish my code!",
  "404: Focus interrupted! Let me work!",
  "I'm in the zone, stop clicking!",
  "Please, let's finish my work!"
];

const idleReactions = [
  "Please, let me do my work!",
  "Are you going to let me code?",
  "Still there? Let me finish my work!",
  "Back to writing code..."
];

let angryTimer = null;
let idleTimer = null;
let bubbleHideTimer = null;
let isHovered = false;

// Real-time tracking coordinates & lerp variables
let targetPupilX = 0, targetPupilY = 0;
let currPupilX = 0, currPupilY = 0;
let targetHeadX = 0, targetHeadY = 0, targetHeadRot = 0;
let currHeadX = 0, currHeadY = 0, currHeadRot = 0;
let trackingRafId = null;

function animateTracking() {
  currPupilX += (targetPupilX - currPupilX) * 0.35;
  currPupilY += (targetPupilY - currPupilY) * 0.35;
  currHeadX += (targetHeadX - currHeadX) * 0.30;
  currHeadY += (targetHeadY - currHeadY) * 0.30;
  currHeadRot += (targetHeadRot - currHeadRot) * 0.30;

  if (pupilLeft && pupilRight) {
    const pTransform = `translate(${currPupilX.toFixed(2)}px, ${currPupilY.toFixed(2)}px)`;
    pupilLeft.style.transform = pTransform;
    pupilRight.style.transform = pTransform;
  }

  if (headTurned) {
    headTurned.style.transform = `translate(${currHeadX.toFixed(2)}px, ${currHeadY.toFixed(2)}px) rotate(${currHeadRot.toFixed(2)}deg)`;
  }

  const isStillMoving =
    Math.abs(targetPupilX - currPupilX) > 0.02 ||
    Math.abs(targetPupilY - currPupilY) > 0.02 ||
    Math.abs(targetHeadX - currHeadX) > 0.02 ||
    Math.abs(targetHeadRot - currHeadRot) > 0.02;

  if (isHovered || isStillMoving) {
    trackingRafId = requestAnimationFrame(animateTracking);
  } else {
    trackingRafId = null;
  }
}

function startTrackingLoop() {
  if (!trackingRafId) {
    trackingRafId = requestAnimationFrame(animateTracking);
  }
}

// Fired when cursor stays motionless inside the card for 2.4s
function onInactivityTimeout() {
  if (!isHovered || illusTile.classList.contains('is-angry')) return;

  const chosenLine = idleReactions[Math.floor(Math.random() * idleReactions.length)];
  speechText.textContent = chosenLine;
  illusTile.classList.add('show-bubble');

  // Turn head back to laptop and resume coding
  illusTile.classList.remove('is-watching');
  if (statusLabel) statusLabel.textContent = `// status: "${chosenLine}" — resumed coding`;

  // Hide the bubble after 2.5s while he keeps coding
  clearTimeout(bubbleHideTimer);
  bubbleHideTimer = setTimeout(() => {
    illusTile.classList.remove('show-bubble');
  }, 2500);
}

function triggerAngryReaction() {
  if (!illusTile || !speechText) return;
  clearTimeout(angryTimer);
  clearTimeout(idleTimer);
  clearTimeout(bubbleHideTimer);

  const chosenReaction = angryReactions[Math.floor(Math.random() * angryReactions.length)];
  speechText.textContent = chosenReaction;
  illusTile.classList.remove('show-bubble');
  illusTile.classList.add('is-angry', 'is-watching');
  if (statusLabel) statusLabel.textContent = "ANGRY // interrupted!";

  angryTimer = setTimeout(() => {
    illusTile.classList.remove('is-angry');
    if (isHovered) {
      if (statusLabel) statusLabel.textContent = "watching your cursor 👀";
      // Restart inactivity timer
      clearTimeout(idleTimer);
      idleTimer = setTimeout(onInactivityTimeout, 2400);
    } else {
      illusTile.classList.remove('is-watching');
      if (statusLabel) statusLabel.textContent = "focus mode — coding...";
    }
  }, 2200);
}

if (illusTile) {
  illusTile.addEventListener('mouseenter', () => {
    isHovered = true;
    if (!illusTile.classList.contains('is-angry')) {
      illusTile.classList.add('is-watching');
      illusTile.classList.remove('show-bubble');
      if (statusLabel) statusLabel.textContent = "watching your cursor 👀";
    }
    startTrackingLoop();
  });

  illusTile.addEventListener('mousemove', e => {
    isHovered = true;
    clearTimeout(bubbleHideTimer);

    // If we were in idle-resumed-coding state, dismiss bubble and turn head back to watch cursor
    if (!illusTile.classList.contains('is-angry')) {
      illusTile.classList.remove('show-bubble');
      illusTile.classList.add('is-watching');
      if (statusLabel) statusLabel.textContent = "watching your cursor 👀";
    }

    const r = illusTile.getBoundingClientRect();
    // Head center in relative coords (~30.8% X, ~31.5% Y)
    const faceX = r.left + r.width * 0.308;
    const faceY = r.top + r.height * 0.315;

    const dx = e.clientX - faceX;
    const dy = e.clientY - faceY;
    const angle = Math.atan2(dy, dx);
    const distRatio = Math.min(1, Math.hypot(dx, dy) / (r.width * 0.44));

    // Pupils offset calculation within eye whites
    targetPupilX = Math.cos(angle) * distRatio * 3.4;
    targetPupilY = Math.sin(angle) * distRatio * 2.5;

    // Head tilt & rotation
    targetHeadX = Math.cos(angle) * distRatio * 2.4;
    targetHeadY = Math.sin(angle) * distRatio * 1.8;
    targetHeadRot = Math.max(-6, Math.min(6, (dx / (r.width * 0.5)) * 5));

    startTrackingLoop();

    // Reset inactivity timer on every mouse move
    clearTimeout(idleTimer);
    if (!illusTile.classList.contains('is-angry')) {
      idleTimer = setTimeout(onInactivityTimeout, 2400);
    }
  });

  illusTile.addEventListener('mouseleave', () => {
    isHovered = false;
    clearTimeout(idleTimer);
    clearTimeout(bubbleHideTimer);

    illusTile.classList.remove('is-watching', 'show-bubble');

    // Return head and pupils to neutral
    targetPupilX = 0;
    targetPupilY = 0;
    targetHeadX = 0;
    targetHeadY = 0;
    targetHeadRot = 0;

    startTrackingLoop();

    if (!illusTile.classList.contains('is-angry') && statusLabel) {
      statusLabel.textContent = "focus mode — coding...";
    }
  });

  illusTile.addEventListener('click', triggerAngryReaction);
  illusTile.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerAngryReaction();
    }
  });
}

/* ============================================================
   Assistant Widget: Sleek AI Launcher & Fixed Chat Panel
   ============================================================ */
const fabHolder = document.getElementById('fabHolder');
const fab = document.getElementById('assistantFab');
const tooltip = document.getElementById('fabTooltip');
const panelFrame = document.getElementById('panelFrame');
const apCloseBtn = document.getElementById('apClose');
const apBody = document.getElementById('apBody');
const apInput = document.getElementById('apInput');
const apSendBtn = document.getElementById('apSend');
const apSuggestions = document.getElementById('apSuggestions');

if (fabHolder && fab && panelFrame) {
  // Show tooltip on hover only when closed
  fabHolder.addEventListener('mouseenter', () => {
    if (!panelFrame.classList.contains('open') && tooltip) {
      tooltip.classList.add('show');
    }
  });

  fabHolder.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.remove('show');
  });

  function openPanel() {
    panelFrame.classList.add('open');
    fab.classList.add('is-open');
    document.body.classList.add('chat-is-open');
    if (tooltip) tooltip.classList.remove('show');
    if (toTop) toTop.classList.add('chat-left-shift');
    setTimeout(() => {
      if (apInput) apInput.focus();
    }, 280);
  }

  function closePanel() {
    panelFrame.classList.remove('open');
    fab.classList.remove('is-open');
    document.body.classList.remove('chat-is-open');
    if (toTop) toTop.classList.remove('chat-left-shift');
  }

  fab.addEventListener('click', () => {
    panelFrame.classList.contains('open') ? closePanel() : openPanel();
  });

  if (apCloseBtn) {
    apCloseBtn.addEventListener('click', closePanel);
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panelFrame.classList.contains('open')) {
      closePanel();
    }
  });

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    if (apBody) {
      apBody.appendChild(div);
      apBody.scrollTop = apBody.scrollHeight;
    }
    return div;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'typing';
    t.id = 'typingIndicator';
    t.innerHTML = '<i></i><i></i><i></i>';
    if (apBody) {
      apBody.appendChild(t);
      apBody.scrollTop = apBody.scrollHeight;
    }
  }

  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  // ── localStorage persistence ─────────────────────────────────────────────
  // Saves the conversation with a sliding 24-hour expiry window.
  // All access is wrapped in try/catch — if storage is unavailable
  // (e.g. private/incognito mode with strict settings) the widget
  // simply behaves as it does without persistence; no errors surface.
  const STORAGE_KEY = 'tapendu_chat_history';
  const EXPIRY_MS   = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  function saveChat() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: conversationHistory,
        lastActivity: Date.now(),
      }));
    } catch (_) { /* storage unavailable — silently ignore */ }
  }

  function loadChat() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        !Array.isArray(parsed.messages) ||
        parsed.messages.length === 0 ||
        typeof parsed.lastActivity !== 'number' ||
        Date.now() - parsed.lastActivity >= EXPIRY_MS
      ) {
        // Expired or malformed — remove and treat as fresh session
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed.messages;
    } catch (_) {
      return null; // storage unavailable or JSON corrupt — start fresh
    }
  }

  // ── Conversation history ────────────────────────────────────────────────
  // Keeps the running message log in the format Groq expects.
  // The system message is added server-side in api/chat.js — not here.
  const conversationHistory = [];

  // ── Restore saved conversation on page load ──────────────────────────────
  // Runs once, immediately. Checks localStorage for a valid session
  // (within the 24-hour window) and, if found, re-renders the saved
  // messages as plain bubbles (no typing animation — instant restore).
  // If no valid session exists, the default welcome message and suggestion
  // chips that are already in the HTML remain untouched.
  (function restoreSession() {
    const saved = loadChat();
    if (!saved) return; // no valid session — keep the welcome message & chips

    // A prior conversation exists — clear the default welcome content
    // (the static welcome bubble + suggestion chips baked into the HTML)
    // and re-render the saved messages in order.
    if (apBody) {
      apBody.innerHTML = '';
      saved.forEach(msg => {
        const who = msg.role === 'user' ? 'user' : 'bot';
        addMsg(msg.content, who);
      });
    }

    // Restore the in-memory history so new messages continue the thread
    conversationHistory.push(...saved);

    // Hide suggestion chips — they're meaningless mid-conversation.
    // The chip container is inside apBody (already cleared above),
    // but guard in case DOM structure ever changes.
    if (apSuggestions) apSuggestions.style.display = 'none';
  })();

  // ── Live page context scraper ────────────────────────────────────────────
  // Called fresh on every send so the AI always sees the latest DOM content.
  // Never caches — if Tapendu updates his portfolio, the AI reflects it automatically.
  function gatherPageContext() {
    const sectionMap = [
      { id: 'about',      label: 'About' },
      { id: 'skills',     label: 'Skills' },
      { id: 'projects',   label: 'Projects' },
      { id: 'experience', label: 'Experience' },
      { id: 'education',  label: 'Education' },
      { id: 'contact',    label: 'Contact' },
    ];

    return sectionMap
      .map(({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return null;
        // Collapse repeated whitespace/newlines to single spaces/newlines for cleaner context
        const raw = (el.innerText || el.textContent || '').trim();
        const cleaned = raw.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
        return `${label}:\n${cleaned}`;
      })
      .filter(Boolean)
      .join('\n\n---\n\n');
  }

  // ── Real AI send handler ─────────────────────────────────────────────────
  async function handleAsk(text) {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();

    // 1. Display user message and clear input
    addMsg(trimmed, 'user');
    if (apInput) apInput.value = '';

    // 2. Add to history BEFORE the fetch so the full history goes to the API
    conversationHistory.push({ role: 'user', content: trimmed });

    // 3. Show typing indicator while waiting
    showTyping();

    // 4. Gather fresh page context right now
    const pageContext = gatherPageContext();

    // 5. Call the Vercel serverless function
    try {
      const response = await fetch('https://pal-tapendu.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          pageContext,
        }),
      });

      hideTyping();

      if (!response.ok) {
        // Try to read a structured error from the server
        let errMsg = 'Sorry, I\'m having trouble connecting right now — please try again in a moment.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) { /* use fallback */ }
        addMsg(errMsg, 'bot');
        // Remove the user message we just added from history so the context stays clean
        conversationHistory.pop();
        return;
      }

      const data = await response.json();
      const reply = data.reply || 'I received an empty response — please try again.';

      // 6. Add assistant reply to history, display it, and persist both turns
      conversationHistory.push({ role: 'assistant', content: reply });
      addMsg(reply, 'bot');
      saveChat(); // persist user + assistant turn together after a successful round-trip

    } catch (networkError) {
      // Network failure (offline, DNS, CORS issue, etc.)
      hideTyping();
      addMsg('Sorry, I\'m having trouble connecting right now — please try again in a moment.', 'bot');
      // Roll back the user message from history so next attempt is clean
      conversationHistory.pop();
    }
  }

  if (apSuggestions) {
    apSuggestions.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip || chip.classList.contains('chip-disabled')) return;
      handleAsk(chip.dataset.q);
      apSuggestions.querySelectorAll('.chip').forEach(c => {
        c.classList.add('chip-disabled');
        if (c === chip) c.classList.add('chip-picked');
      });
    });
  }

  if (apSendBtn) {
    apSendBtn.addEventListener('click', () => {
      if (apInput) handleAsk(apInput.value);
    });
  }

  if (apInput) {
    apInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAsk(apInput.value);
    });
  }
}


