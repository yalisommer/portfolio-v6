export interface Detection {
  x: number   // left edge in display pixels
  y: number   // top edge in display pixels
  w: number   // width in display pixels
  h: number   // height in display pixels
  label: string
  score: number
}

// Draw a video/image frame into a 640×640 canvas and return normalized NCHW Float32Array
export function preprocessFrame(
  el: HTMLVideoElement | HTMLImageElement,
  inputSize = 640,
): Float32Array {
  const canvas = document.createElement('canvas')
  canvas.width = inputSize
  canvas.height = inputSize
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(el, 0, 0, inputSize, inputSize)
  const { data } = ctx.getImageData(0, 0, inputSize, inputSize)

  // NCHW: [1, 3, 640, 640]
  const pixels = inputSize * inputSize
  const tensor = new Float32Array(3 * pixels)
  for (let i = 0; i < pixels; i++) {
    tensor[i]              = data[i * 4]     / 255.0  // R
    tensor[pixels + i]     = data[i * 4 + 1] / 255.0  // G
    tensor[pixels * 2 + i] = data[i * 4 + 2] / 255.0  // B
  }
  return tensor
}

interface RawBox {
  x: number; y: number; w: number; h: number
  score: number
  classIdx: number
}

// YOLOv8 output: [1, numClasses+4, 8400]
// dims[1] is dynamic — read at runtime
export function postprocess(
  output: Float32Array,
  dims: readonly number[],
  confThresh = 0.4,
  iouThresh = 0.45,
  origW: number,
  origH: number,
  classNames?: string[],
  inputSize = 640,
): Detection[] {
  const numDets = dims[2]
  const numAttrs = dims[1]     // 4 + numClasses
  const numClasses = numAttrs - 4

  // Scale factor: model input size → display size
  const scaleX = origW / inputSize
  const scaleY = origH / inputSize

  const candidates: RawBox[] = []

  for (let i = 0; i < numDets; i++) {
    // output is stored as [attr0_det0, attr0_det1, ..., attr1_det0, ...]
    const cx  = output[0 * numDets + i]
    const cy  = output[1 * numDets + i]
    const bw  = output[2 * numDets + i]
    const bh  = output[3 * numDets + i]

    let bestScore = 0
    let bestClass = 0
    for (let c = 0; c < numClasses; c++) {
      const s = output[(4 + c) * numDets + i]
      if (s > bestScore) {
        bestScore = s
        bestClass = c
      }
    }

    if (bestScore < confThresh) continue

    candidates.push({
      x: (cx - bw / 2) * scaleX,
      y: (cy - bh / 2) * scaleY,
      w: bw * scaleX,
      h: bh * scaleY,
      score: bestScore,
      classIdx: bestClass,
    })
  }

  // NMS per class
  const results: Detection[] = []
  const classes = [...new Set(candidates.map(c => c.classIdx))]
  for (const cls of classes) {
    const boxes = candidates.filter(c => c.classIdx === cls)
    const kept = nms(boxes, iouThresh)
    for (const b of kept) {
      const label = classNames?.[b.classIdx] ?? `Fish ${Math.round(b.score * 100)}%`
      results.push({ x: b.x, y: b.y, w: b.w, h: b.h, label, score: b.score })
    }
  }
  return results
}

function iou(a: RawBox, b: RawBox): number {
  const x1 = Math.max(a.x, b.x)
  const y1 = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.w, b.x + b.w)
  const y2 = Math.min(a.y + a.h, b.y + b.h)
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const union = a.w * a.h + b.w * b.h - inter
  return union > 0 ? inter / union : 0
}

function nms(boxes: RawBox[], iouThresh: number): RawBox[] {
  const sorted = [...boxes].sort((a, b) => b.score - a.score)
  const kept: RawBox[] = []
  const suppressed = new Set<number>()
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    kept.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (!suppressed.has(j) && iou(sorted[i], sorted[j]) > iouThresh) {
        suppressed.add(j)
      }
    }
  }
  return kept
}
