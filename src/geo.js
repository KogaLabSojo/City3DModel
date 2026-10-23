/** 市役所マーカーを原点にした、1/1000 模型上のメートル座標。 */

export const MODEL_DENOMINATOR = 1000

const METERS_PER_DEG_LAT = 111132

export function enuMeters(lat, lon, origin) {
  const metersPerDegLon = METERS_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180)
  return {
    east: (lon - origin.lon) * metersPerDegLon,
    north: (lat - origin.lat) * METERS_PER_DEG_LAT,
  }
}

/**
 * マーカー画像の +X は右、+Y は上、+Z はマーカー面からカメラ側（模型では上）。
 * yawDeg は、マーカー上辺が指す方位。北が 0、東が 90、時計回り。
 * 返り値は模型上のメートル。1/1000 なので実距離 100m が 0.1m。
 */
export function toModelPosition(lat, lon, origin, yawDeg) {
  const {east, north} = enuMeters(lat, lon, origin)
  const yaw = (yawDeg * Math.PI) / 180
  const x = east * Math.cos(yaw) - north * Math.sin(yaw)
  const y = east * Math.sin(yaw) + north * Math.cos(yaw)
  return {
    x: x / MODEL_DENOMINATOR,
    y: y / MODEL_DENOMINATOR,
    east,
    north,
  }
}

export function formatDistance(meters) {
  const rounded = Math.abs(meters)
  if (rounded < 1000) {
    return `${Math.round(rounded)}m`
  }
  return `${(rounded / 1000).toFixed(2)}km`
}
