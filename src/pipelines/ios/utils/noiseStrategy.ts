import { createIOSBufferCanvas } from './canvasConstraints'

/**
 * iOS Safe Noise Strategy
 * 
 * Replaces per-frame pixel manipulation (getImageData/putImageData) with
 * cached static noise textures blended via globalCompositeOperation.
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
 * Generates a seamless noise texture.
 * Used for both Grain and Noise effects.
 */
function generateNoiseTexture(
    width: number,
    height: number,
    amount: number,   // 0-1 range typically
    scale: number,
    colored: boolean = false
): HTMLCanvasElement {
    const canvas = createIOSBufferCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    // Optimize: Make noise smaller and scale up if scale > 1
    // This saves generation time
    const genW = Math.ceil(width / scale)
    const genH = Math.ceil(height / scale)

    // Create temp buffer for generation if scaling
    const genCanvas = scale === 1 ? canvas : createIOSBufferCanvas(genW, genH)
    const genCtx = genCanvas.getContext('2d')!

    const imgData = genCtx.createImageData(genW, genH)
    const data = imgData.data
    const len = data.length

    // Reduce intensity to meaningful range for alpha blending
    // e.g. amount 0.5 -> variance +/- 128? 
    // Usually we want a grey texture with noise.
    // For overlay blend mode: 128 is neutral.
    // Noise values should range from (128 - amp) to (128 + amp)
    const amp = amount * 127

    for (let i = 0; i < len; i += 4) {
        if (colored) {
            data[i] = 128 + (Math.random() - 0.5) * amp * 2
            data[i + 1] = 128 + (Math.random() - 0.5) * amp * 2
            data[i + 2] = 128 + (Math.random() - 0.5) * amp * 2
        } else {
            const val = 128 + (Math.random() - 0.5) * amp * 2
            data[i] = val
            data[i + 1] = val
            data[i + 2] = val
        }
        // Full opacity, we control blend via globalAlpha or just let overlay work
        data[i + 3] = 255
    }

    genCtx.putImageData(imgData, 0, 0)

    // If scaled, draw back to main canvas with nearest neighbor for pixel look,
    // or linear for smooth noise. Grain usually looks better with "crisp" edges (nearest).
    if (scale !== 1) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(genCanvas, 0, 0, width, height)
    }

    return canvas
}

/**
 * Applies cached noise/grain to the context.
 */
export function applySafeNoise(
    ctx: CanvasRenderingContext2D,
    cache: NoiseCache,
    width: number,
    height: number,
    // Params unique to noise type
    intensity: number,
    scale: number,
    type: 'grain' | 'noise', // grain is usually mono, noise might be colored or just different param mapping
    seed?: number // Ignored for simple random noise but kept for API shape
) {
    if (intensity <= 0) return

    // Serialized params key
    const paramsKey = `${width}x${height}-${intensity}-${scale}-${type}`

    if (!cache.isValid || cache.params !== paramsKey || !cache.buffer) {
        // Generate new texture
        // Grain: simple mono noise
        // Noise: maybe colored? For now assume mono for performance unless requested
        const texture = generateNoiseTexture(width, height, intensity, scale, false)

        cache.buffer = texture
        cache.params = paramsKey
        cache.isValid = true
    }

    if (cache.buffer) {
        ctx.save()
        // Overlay blend mode computes:
        // (Target < 0.5) ? (2 * Target * Source) : (1 - 2 * (1 - Target) * (1 - Source))
        // Since Source is ~0.5 (128), it's close to neutral pass-through via scaling.
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 1.0 // Intensity baked into texture, but we can modulate if needed
        ctx.drawImage(cache.buffer, 0, 0, width, height)
        ctx.restore()
    }
}
