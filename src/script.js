import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import vertexPlaneShader from "./shaders/imageDistortion/vertex.glsl"
import fragmentPlaneShader from "./shaders/imageDistortion/fragment.glsl"

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const pictureFaceTexture = textureLoader.load("/assets/1.jpg")

// Plane
const planeGeometry = new THREE.PlaneBufferGeometry(1, 2, 600, 800)
const countPlaneGeometry = planeGeometry.attributes.position.count
const randoms = new Float32Array(countPlaneGeometry).map(
  () => Math.random() - 0.5
)
planeGeometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1))

const planeMaterial = new THREE.RawShaderMaterial({
  side: THREE.DoubleSide,
  wireframe: false,
  vertexShader: vertexPlaneShader,
  fragmentShader: fragmentPlaneShader,
  uniforms: {
    uTexture: { value: pictureFaceTexture },
    uTime: { value: 0 },
    uDistortionMultiplier: { value: 1 },
  },
})
const plane = new THREE.Points(planeGeometry, planeMaterial)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = 0
camera.position.y = 0
camera.position.z = -5
camera.lookAt(plane.position)

// Control
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
// controls.minDistance = 1
controls.maxDistance = 11
controls.minPolarAngle = Math.PI / 2 - 0.2
controls.maxPolarAngle = Math.PI / 2 + 0.2
const initialCameraPosition = { ...camera.position }

// Scene
scene.add(camera)
scene.add(plane)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)

let stop = false
setTimeout(() => {
  renderer.domElement.addEventListener("click", () => {
    console.log("triggered")
    stop = !stop
  })
}, 3000)

// Animate
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  planeMaterial.uniforms.uTime.value = elapsedTime

  if (stop) {
    if (planeMaterial.uniforms.uDistortionMultiplier.value < 0.01) {
      planeMaterial.uniforms.uDistortionMultiplier.value = 0
    } else {
      planeMaterial.uniforms.uDistortionMultiplier.value -= 0.01
    }
  } else {
    if (planeMaterial.uniforms.uDistortionMultiplier.value < 1) {
      planeMaterial.uniforms.uDistortionMultiplier.value += 0.01
    }
  }

  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
