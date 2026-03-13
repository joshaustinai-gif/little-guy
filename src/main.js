const STANDING = '/dangling.png'
const DANGLING = '/standing.png'
const FALLING  = '/falling.png'

const guy = document.getElementById('guy')

// Character dimensions (will be read from loaded image)
const W_STAND = 120
const W_FALL  = 180

// Physics
const GRAVITY = 1800   // px/s²
const GROUND_PADDING = 150 // px above bottom edge

// State
let state = 'standing' // standing | held | falling
let x = 0, y = 0       // top-left position of character
let vx = 0, vy = 0     // velocity px/s

// Mouse tracking for throw velocity
let lastMouseX = 0, lastMouseY = 0
let lastMouseTime = 0
let mouseVX = 0, mouseVY = 0

// Drag offset (cursor relative to character top-left)
let offsetX = 0, offsetY = 0

// RAF handle
let rafId = null
let lastTime = null

function charWidth()  { return state === 'falling' ? W_FALL : W_STAND }
function charHeight() { return parseInt(getComputedStyle(guy).height) || (state === 'falling' ? 180 : 260) }

function groundY() {
  return window.innerHeight - charHeight() - GROUND_PADDING
}

function clampX(val) {
  return Math.max(0, Math.min(window.innerWidth - charWidth(), val))
}

function setPos(nx, ny) {
  x = nx; y = ny
  guy.style.left = x + 'px'
  guy.style.top  = y + 'px'
}

function enterStanding() {
  state = 'standing'
  guy.src = STANDING
  guy.style.width = W_STAND + 'px'
  guy.classList.remove('held')
  // squash on landing
  guy.classList.remove('squash')
  void guy.offsetWidth
  guy.classList.add('squash')
  guy.addEventListener('animationend', () => guy.classList.remove('squash'), { once: true })
  // Snap to ground after image loads (height may change)
  guy.addEventListener('load', () => { y = groundY(); setPos(x, y) }, { once: true })
  stopLoop()
}

function enterHeld(e) {
  if (state === 'falling') stopLoop()
  state = 'held'
  guy.src = DANGLING
  guy.style.width = W_STAND + 'px'
  guy.classList.add('held')
  guy.classList.remove('squash')

  const rect = guy.getBoundingClientRect()
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top

  lastMouseX = e.clientX
  lastMouseY = e.clientY
  lastMouseTime = performance.now()
  mouseVX = 0
  mouseVY = 0
}

function enterFalling() {
  state = 'falling'
  guy.src = FALLING
  guy.style.width = W_FALL + 'px'
  guy.classList.remove('held')

  vx = mouseVX * 0.6
  vy = mouseVY * 0.6

  lastTime = null
  startLoop()
}

function physicsLoop(ts) {
  if (state !== 'falling') return

  if (!lastTime) { lastTime = ts; rafId = requestAnimationFrame(physicsLoop); return }
  const dt = Math.min((ts - lastTime) / 1000, 0.05)
  lastTime = ts

  vy += GRAVITY * dt
  x += vx * dt
  y += vy * dt

  if (x < 0) { x = 0; vx = Math.abs(vx) * 0.3 }
  if (x + charWidth() > window.innerWidth) { x = window.innerWidth - charWidth(); vx = -Math.abs(vx) * 0.3 }

  const gY = groundY()
  if (y >= gY) {
    y = gY
    setPos(x, y)
    enterStanding()
    return
  }

  setPos(x, y)
  rafId = requestAnimationFrame(physicsLoop)
}

function startLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(physicsLoop)
}

function stopLoop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
}

// --- Event listeners ---

guy.addEventListener('mousedown', (e) => {
  e.preventDefault()
  enterHeld(e)
})

window.addEventListener('mousemove', (e) => {
  const now = performance.now()
  const dt = (now - lastMouseTime) / 1000
  if (dt > 0) {
    mouseVX = (e.clientX - lastMouseX) / dt
    mouseVY = (e.clientY - lastMouseY) / dt
  }
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  lastMouseTime = now

  if (state !== 'held') return
  setPos(
    clampX(e.clientX - offsetX),
    Math.max(0, e.clientY - offsetY)
  )
})

window.addEventListener('mouseup', () => {
  if (state !== 'held') return
  enterFalling()
})

guy.addEventListener('touchstart', (e) => {
  e.preventDefault()
  enterHeld(e.touches[0])
}, { passive: false })

window.addEventListener('touchmove', (e) => {
  const t = e.touches[0]
  const now = performance.now()
  const dt = (now - lastMouseTime) / 1000
  if (dt > 0) {
    mouseVX = (t.clientX - lastMouseX) / dt
    mouseVY = (t.clientY - lastMouseY) / dt
  }
  lastMouseX = t.clientX
  lastMouseY = t.clientY
  lastMouseTime = now

  if (state !== 'held') return
  setPos(
    clampX(t.clientX - offsetX),
    Math.max(0, t.clientY - offsetY)
  )
}, { passive: true })

window.addEventListener('touchend', () => {
  if (state !== 'held') return
  enterFalling()
})

window.addEventListener('resize', () => {
  if (state === 'standing') {
    y = groundY()
    x = clampX(x)
    setPos(x, y)
  }
})

// --- Init ---
function init() {
  guy.style.width = W_STAND + 'px'
  x = Math.round((window.innerWidth - W_STAND) / 2)
  y = groundY()
  setPos(x, y)
}

guy.src = STANDING
guy.addEventListener('load', init, { once: true })
if (guy.complete) init()
