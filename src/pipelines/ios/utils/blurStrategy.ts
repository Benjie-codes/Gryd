import { createIOSBufferCanvas } from './canvasConstraints'
import { getBlurTexture, areTexturesLoaded, tileTexture } from './textureLoader'

/**
 * iOS Safe Blur Strategy
 * 
 * Provides two approaches for blur on iOS:
 * 1. Pre-rendered blur textures (preferred) - overlaid for a frosted glass effect
 * 2. Downscale-upscale fallback - cheaper than CSS filter but still functional
 * 
 * Blur textures are 1024x1024 and designed to tile seamlessly.
 */

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
 * Invalidates the blur cache, forcing a re-render on next call.
 */
export function invalidateBlurCache(cache: BlurCache) {
    cache.isValid = false
}

/**
 * Applies a blur effect using pre-rendered textures when available,
 * with downscale-upscale fallback for iOS compatibility.
 * 
 * @param ctx The target context (usually the main display context).
 * @param sourceCanvas The source canvas containing the unblurred image.
 * @param cache The blur cache object for intermediate bitmap.
 * @param strength The blur strength (0-100 range).
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

    // First, draw the blurred base using downscale-upscale
    applyDownscaleBlur(ctx, sourceCanvas, cache, strength, width, height)

    // Then overlay the pre-rendered blur texture for enhanced effect
    if (areTexturesLoaded()) {
        const blurTexture = getBlurTexture(strength)
        if (blurTexture) {
            // Calculate opacity based on strength (stronger blur = more visible texture)
            const opacity = Math.min(0.6, strength / 100)
            tileTexture(ctx, blurTexture, width, height, opacity, 'screen')
        }
    }
}

/**
 * Downscale-upscale blur implementation.
 * Creates a soft blur by drawing to a small buffer and scaling back up.
 */
function applyDownscaleBlur(
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    cache: BlurCache,
    strength: number,
    width: number,
    height: number
) {
    // Reuse or create cache buffer
    if (!cache.isValid || !cache.buffer || cache.strength !== strength || cache.buffer.width === 0) {
        // Calculate downscale factor
        // Higher strength = smaller buffer = more blur
        // Map strength (0-100) to a divisor (2 - 20)
        const divisor = Math.max(2, Math.min(20, strength / 5))

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
            // Quality: turn ON smoothing for the downscale (averages pixels)
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
        // Smoothing ON for blur effect
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'medium' // 'high' can be risky on iOS

        ctx.drawImage(cache.buffer, 0, 0, width, height)
    } else {
        // Fallback
        ctx.drawImage(sourceCanvas, 0, 0, width, height)
    }
}
