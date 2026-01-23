/**
 * iOS Pre-rendered Texture Loader
 * 
 * Loads and caches pre-rendered texture assets for grain and blur effects.
 * Textures are designed to be tiled for seamless coverage across any canvas size.
 * 
 * Grain textures: 512x512 (tileable)
 * Blur textures: 1024x1024 (tileable)
 */

// Import texture paths - Vite handles these as URLs
import grainLight from '../../../assets/textures/grain_light.png'
import grainMedium from '../../../assets/textures/grain_medium.png'
import grainHeavy from '../../../assets/textures/grain_heavy.png'
import blurSoft from '../../../assets/textures/Blur_soft_01.png'
import blurMedium from '../../../assets/textures/Blur_medium_01.png'
import blurHeavy from '../../../assets/textures/Blur_heavy_01.png'

// Texture intensity tiers
export type GrainIntensity = 'light' | 'medium' | 'heavy'
export type BlurIntensity = 'soft' | 'medium' | 'heavy'

// Cache for loaded textures
interface TextureCache {
    grain: Map<GrainIntensity, HTMLImageElement>
    blur: Map<BlurIntensity, HTMLImageElement>
    loaded: boolean
    loading: Promise<void> | null
}

const textureCache: TextureCache = {
    grain: new Map(),
    blur: new Map(),
    loaded: false,
    loading: null
}

// Texture paths mapping
const GRAIN_PATHS: Record<GrainIntensity, string> = {
    light: grainLight,
    medium: grainMedium,
    heavy: grainHeavy
}

const BLUR_PATHS: Record<BlurIntensity, string> = {
    soft: blurSoft,
    medium: blurMedium,
    heavy: blurHeavy
}

/**
 * Loads a single image and returns a promise.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load texture: ${src}`))
        img.src = src
    })
}

/**
 * Preloads all textures. Call this early in app initialization.
 */
export async function preloadTextures(): Promise<void> {
    if (textureCache.loaded) return
    if (textureCache.loading) return textureCache.loading

    textureCache.loading = (async () => {
        try {
            // Load grain textures
            const grainPromises = (Object.entries(GRAIN_PATHS) as [GrainIntensity, string][])
                .map(async ([intensity, path]) => {
                    const img = await loadImage(path)
                    textureCache.grain.set(intensity, img)
                })

            // Load blur textures
            const blurPromises = (Object.entries(BLUR_PATHS) as [BlurIntensity, string][])
                .map(async ([intensity, path]) => {
                    const img = await loadImage(path)
                    textureCache.blur.set(intensity, img)
                })

            await Promise.all([...grainPromises, ...blurPromises])
            textureCache.loaded = true
            console.log('[TextureLoader] All textures preloaded successfully')
        } catch (error) {
            console.error('[TextureLoader] Failed to preload textures:', error)
        }
    })()

    return textureCache.loading
}

/**
 * Maps a 0-1 intensity value to a grain texture tier.
 */
function mapGrainIntensity(amount: number): GrainIntensity {
    if (amount < 0.33) return 'light'
    if (amount < 0.66) return 'medium'
    return 'heavy'
}

/**
 * Maps a blur strength value to a blur texture tier.
 */
function mapBlurIntensity(strength: number): BlurIntensity {
    if (strength < 15) return 'soft'
    if (strength < 35) return 'medium'
    return 'heavy'
}

/**
 * Gets a grain texture image based on intensity.
 * Returns null if textures haven't been loaded.
 */
export function getGrainTexture(amount: number): HTMLImageElement | null {
    const intensity = mapGrainIntensity(amount)
    return textureCache.grain.get(intensity) || null
}

/**
 * Gets a blur texture image based on strength.
 * Returns null if textures haven't been loaded.
 */
export function getBlurTexture(strength: number): HTMLImageElement | null {
    const intensity = mapBlurIntensity(strength)
    return textureCache.blur.get(intensity) || null
}

/**
 * Check if textures are loaded and ready.
 */
export function areTexturesLoaded(): boolean {
    return textureCache.loaded
}

/**
 * Tiles a texture across a canvas context to fill the given dimensions.
 * Uses createPattern for efficient tiling.
 */
export function tileTexture(
    ctx: CanvasRenderingContext2D,
    texture: HTMLImageElement,
    width: number,
    height: number,
    opacity: number = 1.0,
    blendMode: GlobalCompositeOperation = 'overlay'
): void {
    ctx.save()
    
    const pattern = ctx.createPattern(texture, 'repeat')
    if (pattern) {
        ctx.globalCompositeOperation = blendMode
        ctx.globalAlpha = opacity
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, width, height)
    }
    
    ctx.restore()
}
