const container = document.getElementById('visitors')

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

function birdSVG(scale) {
  const w = Math.round(140 * scale)
  const h = Math.round(32 * scale)
  return `<svg viewBox="0 0 140 32" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <path d="M2,16 Q14,4 26,16 M42,11 Q54,0 66,11 M80,17 Q92,5 104,17 M116,12 Q126,2 138,12"
          fill="none" stroke="#1a2a1a" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`
}

function blimpSVG(fromLeft) {
  const flip = fromLeft ? '' : 'transform="scale(-1,1) translate(-320,0)"'
  return `<svg viewBox="0 0 320 110" width="320" height="110" xmlns="http://www.w3.org/2000/svg">
    <g ${flip}>
      <!-- Body -->
      <ellipse cx="150" cy="52" rx="145" ry="46" fill="#D44030"/>
      <!-- Highlight -->
      <ellipse cx="118" cy="36" rx="98" ry="22" fill="#E86050" opacity="0.4"/>
      <!-- Tail fins -->
      <path d="M284,28 L310,6  L310,30 Z" fill="#B83020"/>
      <path d="M284,76 L310,98 L310,74 Z" fill="#B83020"/>
      <path d="M290,52 L318,43 L318,61 Z" fill="#B83020"/>
      <!-- Gondola ropes -->
      <line x1="102" y1="97" x2="112" y2="100" stroke="#6B4A14" stroke-width="2"/>
      <line x1="196" y1="97" x2="186" y2="100" stroke="#6B4A14" stroke-width="2"/>
      <!-- Gondola -->
      <rect x="90" y="98" width="118" height="22" rx="6" fill="#5C3E10"/>
      <!-- Windows -->
      <circle cx="120" cy="52" r="9" fill="#89CFF0" stroke="#B83020" stroke-width="2.5"/>
      <circle cx="150" cy="50" r="9" fill="#89CFF0" stroke="#B83020" stroke-width="2.5"/>
      <circle cx="180" cy="52" r="9" fill="#89CFF0" stroke="#B83020" stroke-width="2.5"/>
    </g>
  </svg>`
}

function balloonSVG() {
  const palettes = [
    { main: '#E53030', mid: '#F06040', dark: '#C01818' },
    { main: '#E89020', mid: '#F5B030', dark: '#C07010' },
    { main: '#3880D0', mid: '#5AAAE0', dark: '#2060B0' },
    { main: '#38A838', mid: '#58C858', dark: '#207820' },
    { main: '#9040C0', mid: '#B068D8', dark: '#6820A0' },
  ]
  const p = palettes[Math.floor(Math.random() * palettes.length)]
  return `<svg viewBox="0 0 110 178" width="110" height="178" xmlns="http://www.w3.org/2000/svg">
    <!-- Balloon envelope -->
    <ellipse cx="55" cy="72" rx="52" ry="66" fill="${p.main}"/>
    <!-- Color panels -->
    <path d="M55,6 Q74,38 74,72 Q74,106 55,138 Q36,106 36,72 Q36,38 55,6Z" fill="${p.dark}" opacity="0.45"/>
    <path d="M55,6 Q36,38 20,62 Q33,96 55,138 Q43,102 36,72 Q32,42 55,6Z" fill="white" opacity="0.1"/>
    <!-- Shine -->
    <ellipse cx="37" cy="42" rx="13" ry="17" fill="white" opacity="0.2"/>
    <!-- Ropes -->
    <line x1="26" y1="133" x2="32" y2="158" stroke="#7A5A10" stroke-width="1.8"/>
    <line x1="84" y1="133" x2="78" y2="158" stroke="#7A5A10" stroke-width="1.8"/>
    <line x1="44" y1="137" x2="43" y2="158" stroke="#7A5A10" stroke-width="1.8"/>
    <line x1="66" y1="137" x2="67" y2="158" stroke="#7A5A10" stroke-width="1.8"/>
    <!-- Basket -->
    <rect x="28" y="158" width="54" height="22" rx="5" fill="#8B6914"/>
    <line x1="46" y1="158" x2="46" y2="180" stroke="#6B5010" stroke-width="1.5"/>
    <line x1="64" y1="158" x2="64" y2="180" stroke="#6B5010" stroke-width="1.5"/>
    <line x1="28" y1="168" x2="82" y2="168" stroke="#6B5010" stroke-width="1.5"/>
  </svg>`
}

// ─── Spawn functions ──────────────────────────────────────────────────────────

function spawnBirds() {
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;pointer-events:none;'
  const fromLeft = Math.random() > 0.5
  const scale = 0.7 + Math.random() * 0.7
  el.innerHTML = birdSVG(scale)
  container.appendChild(el)

  const speed   = 85 + Math.random() * 70
  const dir     = fromLeft ? 1 : -1
  const elW     = Math.round(140 * scale)
  let   x       = fromLeft ? -elW - 10 : window.innerWidth + 10
  const baseY   = window.innerHeight * (0.06 + Math.random() * 0.30)
  const waveAmp = 6 + Math.random() * 14
  const waveSpd = 1.0 + Math.random() * 1.2
  let   t = 0, last = null

  function frame(ts) {
    if (!last) last = ts
    const dt = Math.min((ts - last) / 1000, 0.05)
    last = ts; t += dt
    x += dir * speed * dt
    const y = baseY + Math.sin(t * waveSpd * Math.PI * 2) * waveAmp
    el.style.left = x + 'px'
    el.style.top  = y + 'px'
    const done = fromLeft ? x > window.innerWidth + 20 : x < -elW - 20
    if (done) { el.remove(); return }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function spawnBlimp() {
  const fromLeft = Math.random() > 0.5
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;pointer-events:none;'
  el.innerHTML = blimpSVG(fromLeft)
  container.appendChild(el)

  const speed = 22 + Math.random() * 18
  const dir   = fromLeft ? 1 : -1
  let   x     = fromLeft ? -330 : window.innerWidth + 10
  const y     = window.innerHeight * (0.05 + Math.random() * 0.18)
  // Gentle bob
  let   t = 0, last = null

  function frame(ts) {
    if (!last) last = ts
    const dt = Math.min((ts - last) / 1000, 0.05)
    last = ts; t += dt
    x += dir * speed * dt
    const bob = Math.sin(t * 0.4 * Math.PI * 2) * 4
    el.style.left = x + 'px'
    el.style.top  = (y + bob) + 'px'
    const done = fromLeft ? x > window.innerWidth + 20 : x < -340
    if (done) { el.remove(); return }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function spawnBalloon() {
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;pointer-events:none;'
  el.innerHTML = balloonSVG()
  container.appendChild(el)

  const riseSpd  = 28 + Math.random() * 22
  const driftSpd = (Math.random() - 0.5) * 18
  let   x        = window.innerWidth * (0.08 + Math.random() * 0.84)
  let   y        = window.innerHeight + 20
  // Gentle sway
  let   t = 0, last = null

  function frame(ts) {
    if (!last) last = ts
    const dt = Math.min((ts - last) / 1000, 0.05)
    last = ts; t += dt
    y -= riseSpd * dt
    x += driftSpd * dt + Math.sin(t * 0.5 * Math.PI * 2) * 0.4
    el.style.left = x + 'px'
    el.style.top  = y + 'px'
    if (y < -200) { el.remove(); return }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

function spawnRandom() {
  const r = Math.random()
  if      (r < 0.45) spawnBirds()
  else if (r < 0.75) spawnBalloon()
  else               spawnBlimp()
}

function scheduleNext() {
  const delay = 18000 + Math.random() * 28000 // 18–46 sec
  setTimeout(() => { spawnRandom(); scheduleNext() }, delay)
}

// First visitor appears after 6–12 seconds
setTimeout(spawnRandom, 6000 + Math.random() * 6000)
scheduleNext()
