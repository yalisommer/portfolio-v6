#!/usr/bin/env python3
"""
Train YOLOv8n on the Roboflow Aquarium dataset (HuggingFace).
Classes: fish, jellyfish, penguin, puffin, shark, starfish, stingray
Outputs: public/fish-detector.onnx  (imgsz=416, opset=12)
"""

import io, shutil, subprocess, sys
from pathlib import Path

# ── Install datasets lib if missing ─────────────────────────────────────────
try:
    from datasets import load_dataset
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'datasets', '-q'])
    from datasets import load_dataset

from PIL import Image
from ultralytics import YOLO

CLASS_NAMES = ['fish', 'jellyfish', 'penguin', 'puffin', 'shark', 'starfish', 'stingray']

# ── Download dataset ─────────────────────────────────────────────────────────
print("\n[1/5] Downloading aquarium dataset from HuggingFace…")
dataset = load_dataset("EduardoPacheco/aquarium", trust_remote_code=True)
print(f"      splits: { {k: len(v) for k, v in dataset.items()} }")

# ── Convert to YOLO format on disk ─────────────────────────────────────────
BASE = Path("aquarium_yolo")

def convert_split(split_name: str, hf_key: str):
    img_dir = BASE / "images" / split_name
    lbl_dir = BASE / "labels" / split_name
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    rows = dataset[hf_key]
    print(f"      {split_name}: {len(rows)} images")

    for idx, sample in enumerate(rows):
        # ── Image (already PIL RGB) ─────────────────────────────────────────
        img = sample['image'].convert('RGB')
        W, H = img.size
        img.save(img_dir / f"{idx:05d}.jpg", quality=95)

        # ── Labels: top-level bbox ([x1,y1,x2,y2]) + label (int) lists ─────
        lines = []
        for b, cat in zip(sample['bbox'], sample['label']):
            x1, y1, x2, y2 = b          # x1y1x2y2 pixel coords
            cx = (x1 + x2) / 2 / W
            cy = (y1 + y2) / 2 / H
            w  = (x2 - x1) / W
            h  = (y2 - y1) / H
            if 0 < w <= 1 and 0 < h <= 1:
                lines.append(f"{cat} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")

        (lbl_dir / f"{idx:05d}.txt").write_text("\n".join(lines))

print("\n[2/5] Converting to YOLO format…")
convert_split("train", "train")
convert_split("val",   "validation")

# ── YAML ────────────────────────────────────────────────────────────────────
yaml = (
    f"path: {BASE.absolute()}\n"
    f"train: images/train\n"
    f"val:   images/val\n"
    f"nc: {len(CLASS_NAMES)}\n"
    f"names: {CLASS_NAMES}\n"
)
(BASE / "dataset.yaml").write_text(yaml)
print(f"      YAML → {BASE / 'dataset.yaml'}")

# ── Train ────────────────────────────────────────────────────────────────────
print(f"\n[3/5] Training YOLOv8n (device=cpu, epochs=60, imgsz=416)…")
print(      "      (MPS skipped — known TAL assigner bounds bug on Apple MPS)")

model = YOLO("yolov8n.pt")
model.train(
    data=str(BASE / "dataset.yaml"),
    epochs=60,
    imgsz=416,
    batch=8,
    device="cpu",
    project="runs/fish",
    name="aquarium",
    exist_ok=True,
    verbose=False,
)

# ── Export ONNX ──────────────────────────────────────────────────────────────
print("\n[4/5] Exporting to ONNX (opset=12)…")
best = Path("runs/fish/aquarium/weights/best.pt")
YOLO(best).export(format="onnx", imgsz=416, opset=12, simplify=True)

# ── Copy to public/ ───────────────────────────────────────────────────────────
src = Path("runs/fish/aquarium/weights/best.onnx")
dst = Path("public/fish-detector.onnx")
shutil.copy2(src, dst)
print(f"\n[5/5] Done!  →  {dst}  ({dst.stat().st_size // 1024} KB)")
print(f"      Classes: {CLASS_NAMES}")
