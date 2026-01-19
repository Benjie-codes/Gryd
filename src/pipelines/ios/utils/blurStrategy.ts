import { createIOSBufferCanvas } from './canvasConstraints'

/**
 * iOS Safe Blur Strategy
 * 
 * Replaces expensive and crash-prone `ctx.filter = 'blur()'` with a 
 * performant downscale-upscale approach.
 * 
 * Mechanism:
 * 1. Draw source to a tiny offscreen canvas (scaling down aggressively).
 * 2. Draw the tiny canvas back to the destination (scaling up).
 * 3. The browser's bilinear texturing acts as a poor man's blur.
 * 4. Repeating this pass or stacking layers creates a smoother Gaussian-like look.
 */

// Interface for the cached blur state
export interface BlurCache {
    buffer: HTMLCanvasElement | null
    strength: number
    isValid: boolean
}

/**
 * Creates a new, empty blur cache object.
 */
export function createBlurCache(): BlurCache {
    return {
        buffer: null,
        strength: 0,
        isValid: false
    }
}

/**
 * invalidates the blur cache, forcing a re-render on next call.
 */
export function invalidateBlurCache(cache: BlurCache) {
    cache.isValid = false
}

/**
 * Applies a safe blur effect to the given context.
 * 
 * @param ctx The target context (usually the main display context).
 * @param sourceCanvas The source canvas containing the unblurred image.
 * @param cache The blur cache object to store/retrieve the intermediate bitmap.
 * @param strength The blur strength (radius). Mapped to downscale factor.
 * @param width Current width of the target.
 * @param height Current height of the target.
 */
export function applySafeBlur(
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    cache: BlurCache,
    strength: number,
    width: number,
    height: number
) {
    if (strength <= 0) {
        // No blur, just draw source
        ctx.drawImage(sourceCanvas, 0, 0, width, height)
        return
    }

    // Reuse or create cache buffer
    if (!cache.isValid || !cache.buffer || cache.strength !== strength || cache.buffer.width === 0) {
        // Calculate downscale factor
        // Higher strength = smaller buffer = more blur
        // Map strength (0-100ish) to a divisor (1 - 20)
        const divisor = Math.max(2, Math.min(20, strength / 2))

        const smallW = Math.max(16, Math.floor(width / divisor))
        const smallH = Math.max(16, Math.floor(height / divisor))

        // Create or resize buffer
        if (!cache.buffer) {
            cache.buffer = createIOSBufferCanvas(smallW, smallH)
        } else {
            cache.buffer.width = smallW
            cache.buffer.height = smallH
        }

        const bufferCtx = cache.buffer.getContext('2d')
        if (bufferCtx) {
            // Quality hack: turn ON smoothing for the downscale (averages pixels)
            bufferCtx.imageSmoothingEnabled = true
            bufferCtx.imageSmoothingQuality = 'medium'

            // Draw source to small buffer
            bufferCtx.drawImage(sourceCanvas, 0, 0, smallW, smallH)
        }

        cache.strength = strength
        cache.isValid = true
    }

    if (cache.buffer) {
        // Draw cached small buffer to main context (upscale)
        // Ensure smoothing is ON for the target context to blur the pixels
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'medium' // 'high' is risky on iOS 

        ctx.drawImage(cache.buffer, 0, 0, width, height)
    } else {
        // Fallback
        ctx.drawImage(sourceCanvas, 0, 0, width, height)
    }
}
