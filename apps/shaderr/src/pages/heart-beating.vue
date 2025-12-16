<!--
https://github.com/chenglou/pure-css-shaders-art
https://chenglou.me/pure-css-shaders-art/heart.svg
https://poe.com/s/A3SlUxAj3ATFKKczMHkc
-->
<script setup lang="ts">
import { ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()

// Get canvas and setup WebGL
const canvas = document.getElementById('shader') as HTMLCanvasElement
const gl = canvas.getContext('webgl')

// Vertex shader - simply passes coordinates
const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
`

// Fragment shader - implements the CSS effect with pixelation
const fragmentShaderSource = `
  precision mediump float;

  uniform float u_time;       // Loops from 0 to 1 over 1 second
  uniform vec2 u_mouse;       // Mouse position (0 to 1)
  uniform float u_click;      // 1 if clicking, 0 otherwise
  uniform vec2 u_resolution;  // Canvas resolution
  uniform float u_pixelSize;  // Pixelation amount

  // HSL to RGB conversion function
  vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c/2.0;

    vec3 rgb;
    if(h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if(h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if(h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if(h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if(h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);

    return rgb + m;
  }

  void main() {
    // Apply pixelation by rounding coordinates to grid
    vec2 pixelatedCoord = floor(gl_FragCoord.xy / u_pixelSize) * u_pixelSize;
    // Add half pixel to center the sampling
    pixelatedCoord += u_pixelSize * 0.5;

    // Normalize coordinates to -1 to 1 range (equivalent to --u and --v)
    vec2 uv = (pixelatedCoord / u_resolution) * 2.0 - 1.0;

    // Mouse position effect (equivalent to --u2, --v2)
    float u2 = uv.x - u_mouse.x + 0.5;
    float v2 = ((uv.y + 0.1) * 1.2 - abs(u2) * (1.0 - abs(u2) + u_mouse.y - 0.5));

    // Calculate distance squared (no sqrt, equivalent to --dist)
    float dist = uv.x * uv.x + v2 * v2;

    // Time animation with click speed modifier (equivalent to --timeSin, --timeSinAbs)
    float timeSin = sin(3.14 * u_time * (1.0 + u_click * 3.0));
    float timeSinAbs = abs(timeSin);

    // Calculate color value (equivalent to --color)
    float colorValue = clamp(0.45 - (dist - timeSinAbs * 0.3), 0.0, 1.0);

    // HSL color calculation (equivalent to the CSS hsl() function)
    float hue = colorValue * 360.0 - 180.0 * (1.0 - u_click);
    hue = mod(hue / 360.0, 1.0); // Normalize to 0-1 range and wrap

    vec3 color = hslToRgb(vec3(hue, 0.5, 0.5));

    gl_FragColor = vec4(color, 1.0);
  }
`

// Compile shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

// Create shader program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

const program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Program link error:', gl.getProgramInfoLog(program))
}

// Setup buffers - just a simple rectangle covering the screen
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// Two triangles that cover the entire clip space
const positions = [
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1,
  1,
  1,
]
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

// Get uniform locations
const timeUniformLocation = gl.getUniformLocation(program, 'u_time')
const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse')
const clickUniformLocation = gl.getUniformLocation(program, 'u_click')
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
const pixelSizeUniformLocation = gl.getUniformLocation(program, 'u_pixelSize')

// Variables to track mouse/touch state
let mouse = { x: 0.5, y: 0.5 }
let isClicking = false
const startTime = Date.now()
let pixelSize = 1 // Default no pixelation

// Setup pixelation slider
const pixelationSlider = document.getElementById('pixelation') as HTMLInputElement
const pixelValueDisplay = document.getElementById('pixelValue') as HTMLSpanElement

pixelationSlider.addEventListener('input', function () {
  pixelSize = Number.parseInt(this.value)
  pixelValueDisplay.textContent = `${pixelSize}×${pixelSize}`
})

// Mouse/touch event handlers
function updateMousePosition(event) {
  // Handle both mouse and touch events
  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : mouse.x * canvas.width)
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : mouse.y * canvas.height)

  mouse.x = clientX / canvas.width
  mouse.y = 1.0 - clientY / canvas.height // Flip Y for WebGL coordinate system
}

canvas.addEventListener('mousemove', updateMousePosition)
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  updateMousePosition(e)
})

canvas.addEventListener('mousedown', () => {
  isClicking = true
})
canvas.addEventListener('mouseup', () => {
  isClicking = false
})
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  isClicking = true
  updateMousePosition(e)
})
canvas.addEventListener('touchend', () => {
  isClicking = false
})

// For devices without mouse events, provide default position
canvas.addEventListener('mouseleave', () => {
  mouse = { x: 0.5, y: 0.5 }
})

// Handle canvas resize
function resizeCanvas() {
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

// Render loop
function render() {
  // Calculate time value looping from 0 to 1 every second
  const elapsedMs = Date.now() - startTime
  const time = (elapsedMs % 1000) / 1000

  // Resize canvas if needed
  resizeCanvas()

  // Set uniforms
  gl.useProgram(program)
  gl.uniform1f(timeUniformLocation, time)
  gl.uniform2f(mouseUniformLocation, mouse.x, mouse.y)
  gl.uniform1f(clickUniformLocation, isClicking ? 1.0 : 0.0)
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
  gl.uniform1f(pixelSizeUniformLocation, pixelSize)

  // Setup attributes
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  // Request next frame
  requestAnimationFrame(render)
}

// Start rendering
render()
</script>

<template>
  <canvas ref="canvasRef" class="canvas" />
  <div class="controls">
    Click/tap to change colors<br>
    Move mouse/finger to distort
    <div class="slider-container">
      <span class="slider-label">Pixelation:</span>
      <input id="pixelation" type="range" min="1" max="100" value="1">
      <span id="pixelValue">1×1</span>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  touch-action: none;
}
.controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}
.slider-container {
  margin-top: 10px;
}
.slider-label {
  display: inline-block;
  width: 80px;
}
input[type="range"] {
  vertical-align: middle;
  width: 120px;
}
@media (max-width: 600px) {
  .controls {
    font-size: 12px;
    padding: 5px;
  }
  input[type="range"] {
    width: 80px;
  }
  .slider-label {
    width: 60px;
  }
}
</style>
