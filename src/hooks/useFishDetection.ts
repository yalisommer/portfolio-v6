import { useEffect, useRef, useState } from 'react'
import * as ort from 'onnxruntime-web'
import { preprocessFrame, postprocess, Detection } from '../utils/yolo'

export type DetectionStatus = 'idle' | 'loading' | 'ready' | 'error'

// Matches the 7-class Roboflow Aquarium dataset training order
const AQUARIUM_CLASSES = ['fish', 'jellyfish', 'penguin', 'puffin', 'shark', 'starfish', 'stingray']

export function useFishDetection() {
  const sessionRef = useRef<ort.InferenceSession | null>(null)
  const [status, setStatus] = useState<DetectionStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        // WASM files are served from public/
        ort.env.wasm.wasmPaths = '/'
        ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency ?? 1, 4)

        // Use wasm-only — WebGPU backend's JSEP init can corrupt the WASM
        // runtime state when WebGPU is unavailable, making both backends fail.
        // WebGPU can be re-enabled once the JSEP .mjs files are properly bundled.
        const session = await ort.InferenceSession.create('/fish-detector.onnx', {
          executionProviders: ['wasm'],
        })
        if (cancelled) return
        sessionRef.current = session
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        console.warn('[FishDetection] Failed to load model:', msg)
        setError(msg)
        setStatus('error')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function runDetection(
    el: HTMLVideoElement | HTMLImageElement,
    displayW: number,
    displayH: number,
  ): Promise<Detection[]> {
    const session = sessionRef.current
    if (!session) return []

    const INPUT_SIZE = 416  // model exported at imgsz=416
    const inputData = preprocessFrame(el, INPUT_SIZE)
    const tensor = new ort.Tensor('float32', inputData, [1, 3, INPUT_SIZE, INPUT_SIZE])

    const inputName = session.inputNames[0]
    const results = await session.run({ [inputName]: tensor })

    const outputName = session.outputNames[0]
    const output = results[outputName]

    const all = postprocess(
      output.data as Float32Array,
      output.dims,
      0.15,
      0.35,
      displayW,
      displayH,
      AQUARIUM_CLASSES,
      INPUT_SIZE,
    )
    // Only show fish (class 0)
    return all.filter(d => d.label === 'fish')
  }

  return { status, error, runDetection }
}
