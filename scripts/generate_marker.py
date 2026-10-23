"""ArUco マーカー画像を作り、8th Wall のイメージターゲット素材にする。

追跡画像は縦 3:4。正方形のマーカー（黒枠と、その外側1マス分の白い静穏域）を
横幅いっぱいに中央へ置く。上下に残る白は、検出器が求める縦長に合わせた余白。

実物のマーカー幅は、この白い静穏域を含んだ正方形の一辺に合わせて測る。
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "public" / "image-targets"
TARGET_NAME = "arco-17"


def dictionary_bits(dictionary: cv2.aruco.Dictionary, name: str) -> int:
    marker_size = getattr(dictionary, "markerSize", 0)
    if marker_size:
        return int(marker_size)
    parts = name.split("_")
    if len(parts) >= 2 and "X" in parts[1]:
        return int(parts[1].split("X")[0])
    raise SystemExit(f"マーカーのマス数を判定できません: {name}")


def render_portrait(dictionary_name: str, marker_id: int) -> tuple[np.ndarray, dict]:
    if not hasattr(cv2.aruco, dictionary_name):
        raise SystemExit(f"未知の辞書です: {dictionary_name}")

    dictionary = cv2.aruco.getPredefinedDictionary(getattr(cv2.aruco, dictionary_name))
    bits = dictionary_bits(dictionary, dictionary_name)
    border_bits = 1
    quiet_modules = 1
    marker_modules = bits + 2 * border_bits
    total_modules = marker_modules + 2 * quiet_modules

    module_px = 150
    while (module_px * total_modules) % 3 != 0:
        module_px -= 1
    if module_px < 20:
        raise SystemExit("モジュール寸法を 3:4 に揃えられませんでした。")

    square = module_px * total_modules
    height = square * 4 // 3
    marker_px = module_px * marker_modules
    marker = cv2.aruco.generateImageMarker(dictionary, marker_id, marker_px, borderBits=border_bits)

    canvas = np.full((height, square), 255, np.uint8)
    quiet_px = module_px * quiet_modules
    top = (height - square) // 2 + quiet_px
    left = quiet_px
    canvas[top : top + marker_px, left : left + marker_px] = marker

    info = {
        "dictionary": dictionary_name,
        "id": marker_id,
        "borderBits": border_bits,
        "quietZoneModules": quiet_modules,
        "imageWidthPx": square,
        "imageHeightPx": height,
        "markerWidthRatio": 1.0,
        "note": "tracked image width equals the square marker including the white quiet zone",
    }
    return canvas, info


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dict", default="DICT_4X4_50", dest="dictionary")
    parser.add_argument("--id", type=int, default=17)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    image, info = render_portrait(args.dictionary, args.id)
    args.out.mkdir(parents=True, exist_ok=True)
    image_path = args.out / "arco-17-source.png"
    info_path = args.out / "marker.json"
    cv2.imwrite(str(image_path), image)
    info_path.write_text(json.dumps(info, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(image_path)
    print(f"{image.shape[1]}x{image.shape[0]} dict={args.dictionary} id={args.id}")


if __name__ == "__main__":
    main()
