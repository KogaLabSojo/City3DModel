import {mountCity, compassLabel, placeLayout} from "./city.js"
import {CATEGORIES, PLACES} from "./places.js"
import {formatDistance} from "./geo.js"

const STORAGE_KEY = "kumamoto-model-ar"
const TARGET_NAME = "arco-17"

const desk = new URLSearchParams(location.search).has("desk")

const settings = loadSettings()
let city = null
let selectedId = "toricho"

const statusEl = document.querySelector("#status")
const listEl = document.querySelector("#place-list")
const detailEl = document.querySelector("#detail")
const settingsEl = document.querySelector("#settings")
const markerMmEl = document.querySelector("#marker-mm")
const yawEl = document.querySelector("#yaw")
const yawValueEl = document.querySelector("#yaw-value")
const roofMmEl = document.querySelector("#roof-mm")
const ringsEl = document.querySelector("#show-rings")
const guidesEl = document.querySelector("#show-guides")
const filtersEl = document.querySelector("#filters")

markerMmEl.value = String(settings.markerMm)
yawEl.value = String(settings.yaw)
yawValueEl.textContent = `${settings.yaw}°`
roofMmEl.value = String(settings.roofMm)
ringsEl.checked = settings.showRings
guidesEl.checked = settings.showGuides || desk

function loadSettings() {
  const defaults = {
    markerMm: 80,
    yaw: 0,
    roofMm: 0,
    showRings: true,
    showGuides: false,
    categories: Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, true])),
  }
  try {
    return {...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}
  } catch {
    return defaults
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function currentSettings() {
  return {...settings, selectedId}
}

function setStatus(text) {
  statusEl.textContent = text
}

function renderFilters() {
  filtersEl.replaceChildren()
  for (const [key, category] of Object.entries(CATEGORIES)) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = settings.categories[key] === false ? "chip" : "chip is-on"
    button.style.setProperty("--chip", category.color)
    button.textContent = category.label
    button.addEventListener("click", () => {
      settings.categories[key] = settings.categories[key] === false
      button.classList.toggle("is-on", settings.categories[key])
      persist()
      renderList()
      city?.apply()
    })
    filtersEl.appendChild(button)
  }
}

function renderList() {
  const items = PLACES
    .map((place) => ({place, layout: placeLayout(place, 0)}))
    .filter(({place}) => settings.categories[place.category] !== false)
    .sort((a, b) => Math.hypot(a.layout.east, a.layout.north) - Math.hypot(b.layout.east, b.layout.north))

  listEl.replaceChildren()
  for (const {place, layout} of items) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = place.id === selectedId ? "place is-selected" : "place"
    const distance = Math.hypot(layout.east, layout.north)
    const relation = distance < 20
      ? "位置の基準"
      : `市役所から${compassLabel(layout.east, layout.north)} ${formatDistance(distance)}`
    button.innerHTML = `
      <span class="swatch" style="background:${CATEGORIES[place.category].color}"></span>
      <span>
        <strong>${place.name}</strong>
        <small>${CATEGORIES[place.category].label} ・ ${relation}</small>
      </span>
    `
    button.addEventListener("click", () => selectPlace(place.id))
    listEl.appendChild(button)
  }
}

function renderDetail() {
  const place = PLACES.find((item) => item.id === selectedId) || PLACES[0]
  const layout = placeLayout(place, 0)
  const distance = Math.hypot(layout.east, layout.north)
  const meta = distance < 20
    ? "模型上の位置の基準です"
    : `市役所から${compassLabel(layout.east, layout.north)} ${formatDistance(distance)} ・ 模型上 ${(distance / 10).toFixed(1)}cm`
  detailEl.innerHTML = `
    <p class="kicker">${CATEGORIES[place.category].label}</p>
    <h2>${place.name}</h2>
    <p class="reading">${place.reading}</p>
    <p class="meta">${meta}</p>
    <p>${place.summary}</p>
  `
}

function selectPlace(id) {
  selectedId = id
  renderList()
  renderDetail()
  city?.apply()
  detailEl.scrollIntoView({block: "nearest", behavior: "smooth"})
}

function bindSettings() {
  markerMmEl.addEventListener("input", () => {
    settings.markerMm = clamp(Number(markerMmEl.value), 20, 300)
    persist()
    city?.apply()
  })
  yawEl.addEventListener("input", () => {
    settings.yaw = Number(yawEl.value)
    yawValueEl.textContent = `${settings.yaw}°`
    persist()
    city?.apply()
  })
  roofMmEl.addEventListener("input", () => {
    settings.roofMm = clamp(Number(roofMmEl.value), 0, 200)
    persist()
    city?.apply()
  })
  ringsEl.addEventListener("change", () => {
    settings.showRings = ringsEl.checked
    persist()
    city?.apply()
  })
  guidesEl.addEventListener("change", () => {
    settings.showGuides = guidesEl.checked
    persist()
    city?.apply()
  })
  document.querySelector("#open-settings").addEventListener("click", () => {
    settingsEl.showModal()
  })
  document.querySelector("#close-settings").addEventListener("click", () => {
    settingsEl.close()
  })
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function cameraEl() {
  const camera = document.createElement("a-camera")
  camera.setAttribute("position", desk ? "0 0 0.62" : "0 0 0")
  camera.setAttribute("look-controls", "magicWindowTrackingEnabled: false")
  if (desk) camera.setAttribute("camera", "fov: 55")
  camera.setAttribute("cursor", "fuse: false; rayOrigin: mouse")
  camera.setAttribute("raycaster", "objects: .pin-hit")
  return camera
}

function mountScene() {
  const scene = document.createElement("a-scene")
  scene.setAttribute("renderer", "colorManagement: true; antialias: true")
  scene.setAttribute("vr-mode-ui", "enabled: false")
  scene.setAttribute("device-orientation-permission-ui", "enabled: false")

  if (desk) {
    scene.setAttribute("background", "color: #d5dccb")
    const light = document.createElement("a-light")
    light.setAttribute("type", "ambient")
    light.setAttribute("intensity", "1")
    scene.appendChild(light)
  } else {
    scene.setAttribute("xrweb", "disableWorldTracking: true")
    scene.setAttribute("landing-page", "")
    scene.setAttribute("xrextras-loading", "")
    scene.setAttribute("xrextras-runtime-error", "")
    scene.setAttribute("xrextras-gesture-detector", "")
  }

  scene.appendChild(cameraEl())
  document.querySelector("#stage").appendChild(scene)
  return scene
}

function mountTarget(scene) {
  const target = document.createElement("a-entity")
  target.setAttribute("xrextras-named-image-target", `name: ${TARGET_NAME}`)
  scene.appendChild(target)
  city = mountCity(target, {getSettings: currentSettings, onSelect: selectPlace})
  target.addEventListener("xrextrasimagegeometry", (event) => {
    city.setImageScale(event.detail.scaledWidth)
  })
  target.addEventListener("xrextrasfound", () => {
    setStatus("マーカーに追従しています")
    statusEl.classList.add("is-live")
  })
  target.addEventListener("xrextraslost", () => {
    setStatus("市役所屋上のマーカーを画面の中央に映してください")
    statusEl.classList.remove("is-live")
  })
}

async function loadTarget() {
  const response = await fetch("/image-targets/arco-17.json")
  if (!response.ok) {
    throw new Error("イメージターゲットが見つかりません")
  }
  return response.json()
}

function waitForEngine() {
  if (window.XR8) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("8th Wall エンジンを読み込めませんでした")), 20000)
    window.addEventListener("xrloaded", () => {
      window.clearTimeout(timer)
      resolve()
    }, {once: true})
  })
}

async function boot() {
  renderFilters()
  renderList()
  renderDetail()
  bindSettings()

  if (desk) {
    settings.showGuides = true
    guidesEl.checked = true
    const scene = mountScene()
    const anchor = document.createElement("a-entity")
    scene.appendChild(anchor)
    city = mountCity(anchor, {getSettings: currentSettings, onSelect: selectPlace})
    setStatus("机上プレビューです。北が画面の上、東が右です。")
    statusEl.classList.add("is-live")
    return
  }

  if (!window.isSecureContext) {
    setStatus("カメラを使うには https が必要です。スマホでは npm run dev:phone を使い、表示されたアドレスを開いてください。")
    return
  }

  try {
    const target = await loadTarget()
    await waitForEngine()
    window.XR8.XrController.configure({
      disableWorldTracking: true,
      imageTargetData: [target],
    })
    const scene = mountScene()
    mountTarget(scene)
    setStatus("市役所屋上のマーカーを画面の中央に映してください")
  } catch (error) {
    setStatus(error.message)
  }
}

boot()
