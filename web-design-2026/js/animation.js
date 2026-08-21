export function markSelecting(el) {
  el.classList.add('cell-selecting');
}

export function clearSelecting(el) {
  el.classList.remove('cell-selecting');
}

export function markCorrect(el) {
  el.classList.remove('cell-selecting');
  el.classList.add('cell-correct');
  el.classList.add('cell-pulse');
  setTimeout(() => el.classList.remove('cell-pulse'), 600);
}

export function shakeInvalid(elements) {
  elements.forEach((el) => {
    el.classList.add('cell-invalid');
    setTimeout(() => el.classList.remove('cell-invalid'), 300);
  });
}

export function showDialog(dialogEl, vibrate = false) {
  dialogEl.classList.remove('hidden');
  requestAnimationFrame(() => dialogEl.classList.add('show'));
  if (vibrate && navigator.vibrate) navigator.vibrate([80, 40, 80]);
}

export function hideDialog(dialogEl) {
  dialogEl.classList.remove('show');
  setTimeout(() => dialogEl.classList.add('hidden'), 250);
}

const CONFETTI_COLORS = ['#ff7a1a', '#00eaff', '#b026ff', '#2effa0', '#ffffff'];
const CONFETTI_DURATION_MS = 2500;
const CONFETTI_PARTICLES_PER_BURST = 40;

function createBurst(x, y) {
  const particles = [];
  for (let i = 0; i < CONFETTI_PARTICLES_PER_BURST; i++) {
    const angle = (Math.PI * 2 * i) / CONFETTI_PARTICLES_PER_BURST + Math.random() * 0.3;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 60 + Math.random() * 30,
      maxLife: 90,
    });
  }
  return particles;
}

export function launchConfetti(canvasEl) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvasEl.width = w * dpr;
  canvasEl.height = h * dpr;
  canvasEl.style.width = `${w}px`;
  canvasEl.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const bursts = [
    { x: w * 0.3, y: h * 0.35, delay: 0 },
    { x: w * 0.7, y: h * 0.3, delay: 250 },
    { x: w * 0.5, y: h * 0.45, delay: 500 },
    { x: w * 0.25, y: h * 0.55, delay: 800 },
    { x: w * 0.75, y: h * 0.5, delay: 1100 },
  ];

  let particles = [];
  bursts.forEach((burst) => {
    setTimeout(() => particles.push(...createBurst(burst.x, burst.y)), burst.delay);
  });

  const startTime = performance.now();

  function frame(now) {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.vy += 0.05;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    particles = particles.filter((p) => p.life > 0);
    ctx.globalAlpha = 1;

    if (now - startTime < CONFETTI_DURATION_MS) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }
  requestAnimationFrame(frame);
}

export function launchCometHint(fromEl, toEl, onArrival) {
  if (!fromEl || !toEl) {
    if (onArrival) onArrival();
    return;
  }

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;

  const comet = document.createElement('div');
  comet.className = 'hint-comet-projectile';
  comet.innerHTML = '<span class="comet-spark">✨</span><span class="comet-trail"></span>';
  comet.style.left = `${startX}px`;
  comet.style.top = `${startY}px`;
  document.body.appendChild(comet);

  const duration = 500;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const currentX = startX + (endX - startX) * ease;
    const arcHeight = -45 * Math.sin(progress * Math.PI);
    const currentY = startY + (endY - startY) * ease + arcHeight;

    comet.style.transform = `translate(${currentX - startX}px, ${currentY - startY}px) scale(${1 + 0.35 * Math.sin(progress * Math.PI)})`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      comet.remove();
      spawnSparkleBurst(endX, endY);
      toEl.classList.add('keyword-chip-hint-hit');
      setTimeout(() => toEl.classList.remove('keyword-chip-hint-hit'), 800);
      if (onArrival) onArrival();
    }
  }

  requestAnimationFrame(animate);
}

function spawnSparkleBurst(x, y) {
  const container = document.createElement('div');
  container.className = 'sparkle-burst-container';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;

  for (let i = 0; i < 14; i++) {
    const particle = document.createElement('div');
    particle.className = 'sparkle-particle';
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
    const dist = 24 + Math.random() * 32;
    particle.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    particle.style.setProperty('--color', CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    container.appendChild(particle);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 700);
}

export function playIntroCurtainAnimation(loaderEl, onComplete) {
  if (!loaderEl) {
    if (onComplete) onComplete();
    return;
  }

  let completed = false;
  const startPullCurtain = () => {
    if (completed) return;
    completed = true;
    loaderEl.classList.add('curtain-pulling');
    setTimeout(() => {
      loaderEl.classList.add('hidden');
      if (onComplete) onComplete();
    }, 850);
  };

  loaderEl.addEventListener('click', startPullCurtain, { once: true });
  document.addEventListener('keydown', startPullCurtain, { once: true });

  // Mascot jumps up from bottom to top (~1.6s), then pulls the black screen down
  setTimeout(startPullCurtain, 1650);
}