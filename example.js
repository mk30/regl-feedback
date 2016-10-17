const regl = require('regl')()
const bunny = require('bunny')
const normals = require('angle-normals')
const camera = require('regl-camera')(regl, {
  center: [0, 5, 0],
  distance: 20,
  theta: 1.0,
  phi: 0.7 
})
var feedback = require('./feedbackeffect.js')
var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.97*texture2D(tex, (0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})
const drawBunny = regl({
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    void main () {
      gl_FragColor = vec4(abs(vnormal), 0.2);
    }`,
  vert: `
    precision mediump float;
    uniform mat4 projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    void main () {
      vnormal = normal;
      gl_Position = projection * view * vec4(position, 1.0);
    }`,
  attributes: {
    position: bunny.positions,
    normal: normals(bunny.cells, bunny.positions)
  },
  elements: bunny.cells,
  blend: {
    enable: true,
    func: { src: 'src alpha', dst: 'one minus src alpha' }
  },
  cull: { enable: true }
})
regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] })
  drawfeedback({texture: feedBackTexture})
  camera(() => {
    drawBunny()
    feedBackTexture({ copy: true, min: 'linear', mag: 'linear' })
  })
})
