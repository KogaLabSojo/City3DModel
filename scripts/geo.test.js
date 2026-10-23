import assert from "node:assert/strict"
import test from "node:test"

import {ORIGIN} from "../src/places.js"
import {enuMeters, toModelPosition} from "../src/geo.js"

test("市役所は模型の原点になる", () => {
  const position = toModelPosition(ORIGIN.lat, ORIGIN.lon, ORIGIN, 0)
  assert.ok(Math.abs(position.x) < 1e-9)
  assert.ok(Math.abs(position.y) < 1e-9)
})

test("北へ1000mは模型の+Yへ1m", () => {
  const lat = ORIGIN.lat + 1000 / 111132
  const position = toModelPosition(lat, ORIGIN.lon, ORIGIN, 0)
  assert.ok(Math.abs(position.x) < 1e-6)
  assert.ok(Math.abs(position.y - 1) < 1e-3)
})

test("マーカー上辺が東を向くと、北は模型の-Xになる", () => {
  const {east, north} = enuMeters(ORIGIN.lat + 1000 / 111132, ORIGIN.lon, ORIGIN)
  assert.ok(north > 900)
  assert.ok(Math.abs(east) < 1)
  const position = toModelPosition(ORIGIN.lat + 1000 / 111132, ORIGIN.lon, ORIGIN, 90)
  assert.ok(position.x < -0.9)
  assert.ok(Math.abs(position.y) < 0.05)
})
