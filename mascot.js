/**
 * AI Mascot Character Component (Self-Contained & Reusable)
 * 
 * Friendly robot-astronaut mascot with:
 * - Rounded helmet with side ear pods
 * - Glowing soft cyan/blue curved eyes
 * - Ball-tipped antenna with luminous beacon
 * - Compact rounded astronaut body with "TP" chest badge
 * - Gentle vertical bobbing idle motion
 * - Randomized occasional blinking (with organic double-blink)
 * 
 * Usage:
 *   const mascot = window.createMascot(containerElement, { size: 34 });
 *   mascot.blink();
 *   mascot.destroy();
 */

(function (global) {
  'use strict';

  // Inject component styles if not already present
  function ensureStyles() {
    if (document.getElementById('mascot-component-styles')) return;
    const style = document.createElement('style');
    style.id = 'mascot-component-styles';
    style.textContent = `
      .mascot-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: visible;
      }
      .mascot-svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
        filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4));
      }
      .mascot-bob-group {
        animation: mascotBob 3.2s ease-in-out infinite;
        transform-origin: 50% 50%;
      }
      @keyframes mascotBob {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-2.2px);
        }
      }
      .mascot-eye {
        transform-box: fill-box;
        transform-origin: center;
        transition: transform 0.12s cubic-bezier(0.25, 1, 0.5, 1);
      }
      .mascot-eye.is-blinking {
        transform: scaleY(0.08);
      }
      .mascot-beacon-dot {
        animation: mascotBeaconGlow 2.8s ease-in-out infinite;
      }
      @keyframes mascotBeaconGlow {
        0%, 100% {
          filter: drop-shadow(0 0 2px #00E5FF);
          opacity: 0.88;
        }
        50% {
          filter: drop-shadow(0 0 6px #00E5FF);
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .mascot-bob-group,
        .mascot-beacon-dot {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let mascotInstanceCount = 0;

  function generateMascotSVG(idPrefix) {
    const id = idPrefix || `mascot_${++mascotInstanceCount}`;
    return `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="mascot-svg" role="img" aria-label="AI Buddy Mascot">
  <defs>
    <!-- Helmet Gradient -->
    <linearGradient id="${id}-helmet" x1="25%" y1="10%" x2="75%" y2="95%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="65%" stop-color="#EFF4FB" />
      <stop offset="100%" stop-color="#D5E1F0" />
    </linearGradient>
    <linearGradient id="${id}-helmet-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#A5BCCC" stop-opacity="0.6" />
    </linearGradient>

    <!-- Visor Gradients -->
    <linearGradient id="${id}-visor" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#0E162B" />
      <stop offset="50%" stop-color="#080D1D" />
      <stop offset="100%" stop-color="#03060F" />
    </linearGradient>
    <linearGradient id="${id}-visor-rim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#1E3A6E" stop-opacity="0.25" />
    </linearGradient>

    <!-- Glowing Cyan Accents -->
    <linearGradient id="${id}-cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7DF9FF" />
      <stop offset="100%" stop-color="#00E5FF" />
    </linearGradient>
    <radialGradient id="${id}-beacon" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#E0FBFF" />
      <stop offset="45%" stop-color="#00E5FF" />
      <stop offset="100%" stop-color="#0284C7" />
    </radialGradient>

    <!-- Body Gradients -->
    <linearGradient id="${id}-body" x1="30%" y1="20%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#ECF2FA" />
      <stop offset="100%" stop-color="#C9D9EC" />
    </linearGradient>
    <linearGradient id="${id}-arm" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="#F4F8FD" />
      <stop offset="100%" stop-color="#C5D6E8" />
    </linearGradient>

    <!-- Ear Pods -->
    <linearGradient id="${id}-ear" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#B8CBDF" />
    </linearGradient>

    <!-- Drop Shadows / Glows -->
    <filter id="${id}-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#00E5FF" flood-opacity="0.85" />
    </filter>
  </defs>

  <!-- Mascot Floating / Bobbing Group -->
  <g class="mascot-bob-group">
    
    <!-- 1. BODY & ARMS (Drawn behind the head) -->
    <g class="mascot-body-layer">
      <!-- Torso -->
      <path d="M 33 63 C 30 74 30 86 34.5 91 C 37.5 94.5 62.5 94.5 65.5 91 C 70 86 70 74 67 63 Z"
            fill="url(#${id}-body)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="1" />
      
      <!-- Torso seam / panel contour -->
      <path d="M 36 67 C 42 70 58 70 64 67"
            stroke="#BDD0E4"
            stroke-width="0.8"
            stroke-linecap="round"
            fill="none" />

      <!-- Left Arm -->
      <rect x="22" y="65" width="10" height="17" rx="5"
            transform="rotate(16 27 73.5)"
            fill="url(#${id}-arm)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="0.8" />

      <!-- Right Arm -->
      <rect x="68" y="65" width="10" height="17" rx="5"
            transform="rotate(-16 73 73.5)"
            fill="url(#${id}-arm)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="0.8" />

      <!-- Chest Badge (Circular Badge with "TP") -->
      <g class="mascot-badge" filter="url(#${id}-glow-filter)">
        <circle cx="50" cy="78" r="8" fill="#070E1E" stroke="#00E5FF" stroke-width="1.3" />
        <circle cx="50" cy="78" r="6.8" fill="#00E5FF" opacity="0.08" />
        <text x="50" y="80.8"
              text-anchor="middle"
              font-family="'Instrument Sans', 'Inter', system-ui, -apple-system, sans-serif"
              font-weight="800"
              font-size="6.8"
              fill="#00E5FF"
              letter-spacing="0.4">TP</text>
      </g>
    </g>

    <!-- 2. NECK CONNECTOR -->
    <rect x="42" y="60.5" width="16" height="5" rx="2.5" fill="#B4C7DD" />

    <!-- 3. HEAD & HELMET -->
    <g class="mascot-head-layer">
      <!-- Antenna Stem -->
      <path d="M 50 11.5 L 50 18" stroke="#9BB2C8" stroke-width="2.6" stroke-linecap="round" />
      <path d="M 47 18 C 47 16.6 53 16.6 53 18" fill="#B4C7DD" />

      <!-- Antenna Beacon (Glowing Ball Tip) -->
      <g class="mascot-beacon-group" filter="url(#${id}-glow-filter)">
        <circle cx="50" cy="7.5" r="4.2" fill="url(#${id}-beacon)" class="mascot-beacon-dot" />
        <circle cx="48.6" cy="6" r="1.2" fill="#FFFFFF" opacity="0.85" />
      </g>

      <!-- Side Ear Pods (Headphones) -->
      <!-- Left Ear Pod -->
      <rect x="15" y="30.5" width="7" height="21" rx="3.5"
            fill="url(#${id}-ear)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="0.8" />
      <rect x="16.5" y="34.5" width="4" height="13" rx="2" fill="#091022" />
      <circle cx="18.5" cy="41" r="1.3" fill="#00E5FF" filter="url(#${id}-glow-filter)" />

      <!-- Right Ear Pod -->
      <rect x="78" y="30.5" width="7" height="21" rx="3.5"
            fill="url(#${id}-ear)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="0.8" />
      <rect x="79.5" y="34.5" width="4" height="13" rx="2" fill="#091022" />
      <circle cx="81.5" cy="41" r="1.3" fill="#00E5FF" filter="url(#${id}-glow-filter)" />

      <!-- Outer Helmet Base -->
      <rect x="20" y="17" width="60" height="47" rx="23.5"
            fill="url(#${id}-helmet)"
            stroke="url(#${id}-helmet-stroke)"
            stroke-width="1.2" />

      <!-- Helmet Specular / Top Gloss -->
      <path d="M 31 21 C 40 18.5 60 18.5 69 21 C 64 19.8 36 19.8 31 21 Z"
            fill="#FFFFFF"
            opacity="0.75" />

      <!-- Dark Face Visor Screen -->
      <rect x="26.5" y="23.5" width="47" height="34" rx="17"
            fill="url(#${id}-visor)"
            stroke="url(#${id}-visor-rim)"
            stroke-width="1.2" />

      <!-- Visor Top Glass Reflection Arc -->
      <path d="M 31 27 C 40 25.2 60 25.2 69 27 C 64 28 36 28 31 27 Z"
            fill="#FFFFFF"
            opacity="0.14" />

      <!-- Cheeks Blush (Cute Soft Glow) -->
      <ellipse cx="34.5" cy="43.5" rx="2.5" ry="1.4" fill="#00E5FF" opacity="0.22" />
      <ellipse cx="65.5" cy="43.5" rx="2.5" ry="1.4" fill="#00E5FF" opacity="0.22" />

      <!-- Eyes (Glowing Curved Happy Arcs with soft cyan glow) -->
      <g class="mascot-eyes" filter="url(#${id}-glow-filter)">
        <!-- Left Eye -->
        <path d="M 37.5 40.8 C 38.8 36.8 44.2 36.8 45.5 40.8"
              stroke="#00E5FF"
              stroke-width="3.2"
              stroke-linecap="round"
              fill="none"
              class="mascot-eye mascot-eye-left" />

        <!-- Right Eye -->
        <path d="M 54.5 40.8 C 55.8 36.8 61.2 36.8 62.5 40.8"
              stroke="#00E5FF"
              stroke-width="3.2"
              stroke-linecap="round"
              fill="none"
              class="mascot-eye mascot-eye-right" />
      </g>

      <!-- Tiny Happy Mouth Glow -->
      <path d="M 47.8 47.8 Q 50 49.6 52.2 47.8"
            stroke="#00E5FF"
            stroke-width="1.3"
            stroke-linecap="round"
            fill="none"
            opacity="0.65" />
    </g>
  </g>
</svg>
    `.trim();
  }

  function createMascot(targetContainer, userOptions) {
    ensureStyles();

    const options = Object.assign({
      size: null,
      enableBob: true,
      enableBlink: true,
      className: '',
      id: null
    }, userOptions);

    let container = typeof targetContainer === 'string'
      ? document.querySelector(targetContainer)
      : targetContainer;

    if (!container) {
      console.warn('createMascot: Target container not found');
      return null;
    }

    container.classList.add('mascot-container');
    if (options.className) {
      container.classList.add(...options.className.split(' ').filter(Boolean));
    }

    // Check if container already has a mascot SVG with the same structure
    let svgElement = container.querySelector('.mascot-svg');
    if (!svgElement) {
      container.innerHTML = generateMascotSVG(options.id);
      svgElement = container.querySelector('.mascot-svg');
    }

    if (options.size) {
      const sizeStr = typeof options.size === 'number' ? `${options.size}px` : options.size;
      svgElement.style.width = sizeStr;
      svgElement.style.height = sizeStr;
    }

    const bobGroup = svgElement.querySelector('.mascot-bob-group');
    if (bobGroup && !options.enableBob) {
      bobGroup.style.animation = 'none';
    }

    const eyeElements = svgElement.querySelectorAll('.mascot-eye');
    let blinkTimer = null;
    let isDestroyed = false;

    function triggerBlink(callback) {
      if (isDestroyed || !eyeElements.length) return;
      eyeElements.forEach(el => el.classList.add('is-blinking'));
      setTimeout(() => {
        eyeElements.forEach(el => el.classList.remove('is-blinking'));
        if (typeof callback === 'function') callback();
      }, 140);
    }

    function scheduleNextBlink() {
      if (isDestroyed || !options.enableBlink) return;
      // Randomized interval between 3.2s and 6.8s
      const delay = 3200 + Math.random() * 3600;
      blinkTimer = setTimeout(() => {
        // 20% probability of an organic double-blink
        if (Math.random() < 0.20) {
          triggerBlink(() => {
            setTimeout(() => {
              triggerBlink(() => {
                scheduleNextBlink();
              });
            }, 110);
          });
        } else {
          triggerBlink(() => {
            scheduleNextBlink();
          });
        }
      }, delay);
    }

    if (options.enableBlink) {
      scheduleNextBlink();
    }

    return {
      element: svgElement,
      container: container,
      blink: () => triggerBlink(),
      setBobbing: (enable) => {
        if (bobGroup) {
          bobGroup.style.animation = enable ? '' : 'none';
        }
      },
      destroy: () => {
        isDestroyed = true;
        if (blinkTimer) clearTimeout(blinkTimer);
      }
    };
  }

  // Export to global scope
  global.createMascot = createMascot;
  global.Mascot = {
    create: createMascot,
    getSVG: generateMascotSVG
  };

})(typeof window !== 'undefined' ? window : this);
