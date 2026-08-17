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