import {CATEGORIES, ORIGIN, PLACES} from "./places.js"
import {toModelPosition} from "./geo.js"

const STEM_HEIGHT = 0.018
const LABEL_WIDTH = 0.062
const LABEL_HEIGHT = 0.016

export function compassLabel(east, north) {
  if (Math.hypot(east, north) < 20) return "基準点"
  const degrees = (Math.atan2(east, north) * 180) / Math.PI
  const names = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"]
  const index = Math.round(((degrees % 360) + 360) % 360 / 45) % 8
  return names[index]
}

export function placeLayout(place, yawDeg) {
  return toModelPosition(place.lat, place.lon, ORIGIN, yawDeg)
}

function drawLabel(text, color) {
  const canvas = document.createElement("canvas")
  canvas.width = 768
  canvas.height = 192
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "rgba(252, 248, 242, 0.94)"
  roundRect(ctx, 8, 16, canvas.width - 16, canvas.height - 32, 28)
  ctx.fill()
  ctx.fillStyle = color
  ctx.fillRect(8, 16, 14, canvas.height - 32)
  ctx.fillStyle = "#1c1915"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  let size = 78
  const font = '"Yu Gothic UI", "Yu Gothic", "Hiragino Sans", Meiryo, sans-serif'
  do {
    ctx.font = `700 ${size}px ${font}`
    size -= 4
  } while (ctx.measureText(text).width > 680 && size > 40)
  ctx.fillText(text, canvas.width / 2 + 6, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  if ("colorSpace" in texture && THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace
  }
  texture.needsUpdate = true
  return texture
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function lineLoop(width, height, color) {
  const halfW = width / 2
  const halfH = height / 2
  const points = [
    new THREE.Vector3(-halfW, -halfH, 0),
    new THREE.Vector3(halfW, -halfH, 0),
    new THREE.Vector3(halfW, halfH, 0),
    new THREE.Vector3(-halfW, halfH, 0),
  ]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({color}))
}

function ring(radius, color) {
  const points = []
  const segments = 96
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({color}))
}

function registerComponents() {
  if (AFRAME.components["flat-label"]) return

  AFRAME.registerComponent("flat-label", {
    schema: {
      text: {type: "string"},
      color: {type: "string", default: "#1c1915"},
    },
    init() {
      const texture = drawLabel(this.data.text, this.data.color)
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(LABEL_WIDTH, LABEL_HEIGHT),
        new THREE.MeshBasicMaterial({map: texture, transparent: true, depthWrite: false}),
      )
      mesh.position.z = 0.001
      mesh.renderOrder = 3
      this.el.setObject3D("mesh", mesh)
    },
  })

  AFRAME.registerComponent("city-stem", {
    schema: {
      height: {type: "number", default: STEM_HEIGHT},
      color: {type: "string", default: "#1c1915"},
    },
    init() {
      this.rebuild()
    },
    update() {
      this.rebuild()
    },
    rebuild() {
      const height = this.data.height
      const geometry = new THREE.CylinderGeometry(0.0016, 0.0016, height, 10)
      geometry.rotateX(Math.PI / 2)
      geometry.translate(0, 0, height / 2)
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({color: this.data.color}),
      )
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.0042, 16, 12),
        new THREE.MeshBasicMaterial({color: this.data.color}),
      )
      cap.position.z = height
      mesh.add(cap)
      this.el.setObject3D("mesh", mesh)
    },
  })
}

export function mountCity(parent, {getSettings, onSelect}) {
  registerComponents()

  const meters = document.createElement("a-entity")
  meters.id = "city-meters"
  const yawGroup = document.createElement("a-entity")
  yawGroup.id = "city-yaw"
  meters.appendChild(yawGroup)
  parent.appendChild(meters)

  const guides = document.createElement("a-entity")
  guides.id = "city-guides"
  yawGroup.appendChild(guides)

  const pins = PLACES.map((place, index) => {
    const pin = document.createElement("a-entity")
    pin.classList.add("pin")
    pin.dataset.id = place.id

    const stem = document.createElement("a-entity")
    stem.setAttribute("city-stem", {
      height: STEM_HEIGHT,
      color: CATEGORIES[place.category].color,
    })
    pin.appendChild(stem)

    const side = index % 2 === 0 ? 1 : -1
    const label = document.createElement("a-entity")
    label.setAttribute("position", `${side * 0.02} 0.012 ${STEM_HEIGHT + 0.001}`)
    label.setAttribute("flat-label", {
      text: place.name,
      color: CATEGORIES[place.category].color,
    })
    pin.appendChild(label)

    const hit = document.createElement("a-entity")
    hit.classList.add("pin-hit")
    hit.dataset.id = place.id
    hit.setAttribute("geometry", "primitive: circle; radius: 0.016")
    hit.setAttribute("material", "shader: flat; transparent: true; opacity: 0; color: #ffffff")
    hit.setAttribute("position", `0 0 ${STEM_HEIGHT}`)
    hit.addEventListener("click", (event) => {
      event.stopPropagation()
      onSelect(place.id)
    })
    pin.appendChild(hit)

    yawGroup.appendChild(pin)
    return {place, pin, stem, label, hit, side}
  })

  const north = document.createElement("a-entity")
  north.setAttribute("flat-label", {text: "北", color: "#c23b22"})
  north.setAttribute("position", "0 0.07 0.004")
  north.setAttribute("scale", "0.55 0.7 1")
  yawGroup.appendChild(north)

  function applyGuides() {
    const settings = getSettings()
    const width = settings.markerMm / 1000
    const height = width * (4 / 3)
    while (guides.object3D.children.length > 0) {
      const child = guides.object3D.children[0]
      guides.object3D.remove(child)
      child.traverse?.((node) => {
        node.geometry?.dispose?.()
        if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose())
        else node.material?.dispose?.()
      })
    }
    guides.object3D.visible = settings.showGuides || settings.showRings
    if (settings.showGuides) {
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 64),
        new THREE.MeshBasicMaterial({color: 0xe7efe0, side: THREE.DoubleSide}),
      )
      ground.position.z = -0.002
      guides.object3D.add(ground)
    }
    if (settings.showGuides) {
      const frame = lineLoop(width, height, 0xc23b22)
      frame.position.z = 0.001
      const square = lineLoop(width, width, 0x24344d)
      square.position.z = 0.0015
      guides.object3D.add(frame)
      guides.object3D.add(square)
    }
    if (settings.showRings) {
      for (const radius of [0.1, 0.3, 0.5]) {
        const loop = ring(radius, 0x24344d)
        loop.position.z = 0.001
        guides.object3D.add(loop)
      }
    }
  }

  let imageWidth = 0

  function applyScale() {
    if (!imageWidth) return
    const markerWidth = getSettings().markerMm / 1000
    const scale = imageWidth / markerWidth
    meters.object3D.scale.set(scale, scale, scale)
  }

  function apply() {
    const settings = getSettings()
    yawGroup.object3D.rotation.z = (settings.yaw * Math.PI) / 180
    applyScale()
    const baseZ = -settings.roofMm / 1000
    for (const item of pins) {
      const visible = settings.categories[item.place.category] !== false
      item.pin.object3D.visible = visible
      const layout = placeLayout(item.place, 0)
      item.pin.object3D.position.set(layout.x, layout.y, baseZ)
      const height = item.place.id === settings.selectedId ? STEM_HEIGHT * 1.8 : STEM_HEIGHT
      item.stem.setAttribute("city-stem", "height", height)
      item.label.object3D.position.z = height + 0.001
      item.hit.object3D.position.z = height
      item.label.object3D.scale.setScalar(item.place.id === settings.selectedId ? 1.18 : 1)
    }
    applyGuides()
  }

  apply()

  return {
    apply,
    setImageScale(scaledWidth) {
      if (!scaledWidth) return
      imageWidth = scaledWidth
      applyScale()
    },
  }
}
