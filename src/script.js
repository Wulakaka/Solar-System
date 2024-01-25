import * as THREE from 'three'
import GUI from 'lil-gui'
import {OrbitControls} from "three/addons";
import {PointLightHelper} from "three";


/**
 * debug
 */
const gui = new GUI()

/**
 * Base
 */
// canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)


/**
 * Objects
 */

const parameters = {}
parameters.earthDistance = 6
gui.add(parameters, 'earthDistance').min(5).max(20).step(0.01).name('太阳地球距离')
parameters.earthSize = 1
gui.add(parameters, 'earthSize').min(0.1).max(10).step(0.01).name('地球大小').onChange(() => {
  earth.scale.set(parameters.earthSize, parameters.earthSize, parameters.earthSize)
  person.position.x = parameters.earthSize
})
parameters.earthRevolutionSpeed = 0.1
gui.add(parameters, 'earthRevolutionSpeed').min(0).max(1).step(0.01).name('地球公转')
parameters.earthRotationSpeed = 0.2
gui.add(parameters, 'earthRotationSpeed').min(0).max(1).step(0.01).name('地球自转')

parameters.moonDistance = 2
gui.add(parameters, 'moonDistance').min(0).max(10).step(0.01).name('地月距离')
parameters.moonSize = 0.2
gui.add(parameters, 'moonSize').min(0.1).max(10).step(0.01).name('月球大小').onChange(() => {
  moon.scale.set(parameters.moonSize, parameters.moonSize, parameters.moonSize)
})
parameters.moonRevolution = 1
gui.add(parameters, 'moonRevolution').min(0).max(10).step(0.01).name('月球公转')


const solarOrbit = new THREE.Group()
scene.add(solarOrbit)

// sun
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16)
const sunMaterial = new THREE.MeshStandardMaterial({
  color: 'yellow',
})
const sun = new THREE.Mesh(sphereGeometry, sunMaterial)
solarOrbit.add(sun)

// sunlight
const sunLight = new THREE.PointLight(0xffffff, 230, 20)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 512
sunLight.shadow.mapSize.height = 512
sunLight.shadow.camera.near = 0.1
sunLight.shadow.camera.far = 100

solarOrbit.add(sunLight)
const sunLightHelper = new PointLightHelper(sunLight, 0.1)
solarOrbit.add(sunLightHelper)

// stars
parameters.count = 5000
parameters.size = 0.01
parameters.branches = 3
parameters.radius = 5
parameters.spin = 0.1
parameters.randomness = 0.5
parameters.randomnessPower = 4
parameters.colorNear = '#ff6030'
parameters.colorFar = '#1b3984'


let starsGeometry = null
let starsMaterial = null
let stars = null

const generateStars = () => {
  if (stars) {
    solarOrbit.remove(stars)
  }
  starsGeometry?.dispose()
  starsMaterial?.dispose
  starsGeometry = new THREE.BufferGeometry()
  starsMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  for (let i = 0; i < parameters.count; i++) {
    const index = i % parameters.branches
    const radius = parameters.radius * Math.random()
    const branchAngle = (index / parameters.branches) * Math.PI * 2
    const spinAngle = radius * parameters.spin
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * (Math.random() > 0.5 ? 1 : -1) * radius
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * (Math.random() > 0.5 ? 1 : -1) * radius
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * (Math.random() > 0.5 ? 1 : -1) * radius
    positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX
    positions[i * 3 + 1] = randomY
    positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

    const colorNear = new THREE.Color(parameters.colorNear)
    const colorFar = new THREE.Color(parameters.colorFar)
    const mixedColor = colorNear.clone()
    mixedColor.lerp(colorFar, radius / parameters.radius)
    colors[i * 3] = mixedColor.r
    colors[i * 3 + 1] = mixedColor.g
    colors[i * 3 + 2] = mixedColor.b
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  stars = new THREE.Points(starsGeometry, starsMaterial)
  solarOrbit.add(stars)
}

generateStars()


const guiStars = gui.addFolder('Stars')
guiStars.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateStars)
guiStars.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateStars)
guiStars.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateStars)
guiStars.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateStars)
guiStars.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateStars)
guiStars.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateStars)
guiStars.addColor(parameters, 'colorNear').onFinishChange(generateStars)
guiStars.addColor(parameters, 'colorFar').onFinishChange(generateStars)

// Earth orbit
const earthOrbit = new THREE.Group()
earthOrbit.position.x = parameters.earthDistance
solarOrbit.add(earthOrbit)

// Earth
const earthGroup = new THREE.Group()
earthOrbit.add(earthGroup)

const earthMaterial = new THREE.MeshStandardMaterial({
  color: 'blue',
})
const earth = new THREE.Mesh(sphereGeometry, earthMaterial)
earth.scale.set(parameters.earthSize, parameters.earthSize, parameters.earthSize)
earth.castShadow = true
earth.receiveShadow = true
earthGroup.add(earth)

const person = new THREE.Mesh(
  new THREE.BoxGeometry(3, 1, 1),
  new THREE.MeshBasicMaterial({color: 'red'})
)
person.scale.set(0.1, 0.1, 0.1)
person.position.x = parameters.earthSize
earthGroup.add(person)


// Moon
const moonMaterial = new THREE.MeshStandardMaterial({
  color: 'grey',
})

const moon = new THREE.Mesh(sphereGeometry, moonMaterial)
moon.scale.set(parameters.moonSize, parameters.moonSize, parameters.moonSize)
moon.position.x = parameters.moonDistance
moon.castShadow = true
moon.receiveShadow = true
earthOrbit.add(moon)


/**
 * Sizes
 * @type {{width: number, height: number}}
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(10, 10, 0)
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
// 开启阻尼
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})

// 开启阴影
renderer.shadowMap.enabled = true
// 设置阴影类型
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()
let previousTime = 0
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // 地球公转
  solarOrbit.rotation.y += deltaTime * parameters.earthRevolutionSpeed
  // 地球自转
  earthGroup.rotation.y += deltaTime * parameters.earthRotationSpeed
  // 月球公转
  earthOrbit.rotation.y += deltaTime * parameters.moonRevolution

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
