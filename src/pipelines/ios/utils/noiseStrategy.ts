import { createIOSBufferCanvas } from './canvasConstraints'
import { getGrainTexture, areTexturesLoaded, tileTexture } from './textureLoader'

/**
 * iOS Safe Noise Strategy
 * 
 * Uses pre-rendered tileable grain textures instead of per-frame pixel 
 * manipulation (getImageData/putImageData) which causes issues on iOS WebKit.
 * 
 * Grain textures are 512x512 and designed to tile seamlessly.
 */

export interface NoiseCache {
    buffer: HTMLCanvasElement | null
    params: string // serialized params to check signature
    isValid: boolean
}

export function createNoiseCache(): NoiseCache {
    return {
        buffer: null,
        params: '',
        isValid: false
    }
}

export function invalidateNoiseCache(cache: NoiseCache) {
    cache.isValid = false
}

/**
 * Fallback: Generates a simple noise texture procedurally.
 * Only used if pre-rendered textures fail to load.
 */
function generateFallbackNoiseTexture(
    width: number,
    height: number,
    amount: number,
    scale: number
): HTMLCanvasElement {
    const canvas = createIOSBufferCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    // Create smaller buffer and scale up to reduce computation
    const genW = Math.ceil(width / Math.max(1, scale))
    const genH = Math.ceil(height / Math.max(1, scale))

    const genCanvas = scale === 1 ? canvas : createIOSBufferCanvas(genW, genH)
    const genCtx = genCanvas.getContext('2d')!

    const imgData = genCtx.createImageData(genW, genH)
    const data = imgData.data
    const len = data.length
    const amp = amount * 127

    for (let i = 0; i < len; i += 4) {
        const val = 128 + (Math.random() - 0.5) * amp * 2
        data[i] = val
        data[i + 1] = val
        data[i + 2] = val
        data[i + 3] = 255
    }

    genCtx.putImageData(imgData, 0, 0)

    if (scale !== 1) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(genCanvas, 0, 0, width, height)
    }

    return canvas
}

/**
 * Applies cached noise/grain to the context using pre-rendered textures.
 * Falls back to procedural generation if textures aren't loaded.
 */
export function applySafeNoise(
    ctx: CanvasRenderingContext2D,
    cache: NoiseCache,
    width: number,
    height: number,
    intensity: number,
    scale: number,
    type: 'grain' | 'noise',
    seed?: number
) {
    if (intensity <= 0) return

    // Try to use pre-rendered textures first (preferred for iOS)
    if (areTexturesLoaded()) {
        const texture = getGrainTexture(intensity)
        if (texture) {
            // Use tileTexture for seamless tiling of pre-rendered asset
            // Opacity is modulated by intensity for fine control
            const opacity = Math.min(1.0, intensity * 1.5) // Scale up for visibility
            tileTexture(ctx, texture, width, height, opacity, 'overlay')
            return
        }
    }

    // Fallback to cached procedural generation
    const paramsKey = `${width}x${height}-${intensity}-${scale}-${type}`

    if (!cache.isValid || cache.params !== paramsKey || !cache.buffer) {
        const texture = generateFallbackNoiseTexture(width, height, intensity, scale)
        cache.buffer = texture
        cache.params = paramsKey
        cache.isValid = true
    }

    if (cache.buffer) {
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 1.0
        ctx.drawImage(cache.buffer, 0, 0, width, height)
        ctx.restore()
    }
}
