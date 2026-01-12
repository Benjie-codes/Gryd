import { GrydComposition, GradientLayer, BlendMode, HalftoneGradientEffect, HalftoneSource, HalftoneBlendMode, CorrugatedMetalEffect, MetalBlendMode, MetalLightingStyle, TextureEffect, TextureProperties, GlobalBlurEffect } from '../types'

import textureData from '../data/globalTextures.json'


// =============================================================================
// Canvas Renderer
// Core rendering engine using Canvas 2D API
// Designed with abstraction for future WebGL migration
// =============================================================================

export interface RendererInterface {
    render(composition: GrydComposition): void
    resize(width: number, height: number): void
    destroy(): void
}

export class CanvasRenderer implements RendererInterface {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private offscreenCanvas: HTMLCanvasElement
    private offscreenCtx: CanvasRenderingContext2D
    private animationFrameId: number | null = null

    private lastComposition: GrydComposition | null = null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Failed to get 2D context')
        }
        this.ctx = ctx

        // Create offscreen canvas for layer compositing
        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = canvas.width
        this.offscreenCanvas.height = canvas.height
        const offscreenCtx = this.offscreenCanvas.getContext('2d')
        if (!offscreenCtx) {
            throw new Error('Failed to get offscreen 2D context')
        }
        this.offscreenCtx = offscreenCtx
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    render(composition: GrydComposition): void {
        this.lastComposition = composition
        this.drawFrame(composition)
    }

    resize(width: number, height: number): void {
        // Update both canvases
        this.canvas.width = width
        this.canvas.height = height
        this.offscreenCanvas.width = width
        this.offscreenCanvas.height = height

        // Re-render if we have a composition
        if (this.lastComposition) {
            this.drawFrame(this.lastComposition)
        }
    }

    destroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }

    // ---------------------------------------------------------------------------
    // Rendering Pipeline
    // ---------------------------------------------------------------------------
    private drawFrame(composition: GrydComposition): void {
        const { canvas, layers, globalEffects } = composition
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // Clear canvas with background color
        ctx.fillStyle = canvas.backgroundColor
        ctx.fillRect(0, 0, width, height)

        // Render each visible layer
        for (const layer of layers) {
            if (!layer.visible) continue
            this.renderLayer(layer, width, height)
        }

        // Apply global effects
        // Apply blur first to smooth the underlying gradients
        if (globalEffects.blur?.enabled) {
            this.applyGlobalBlur(globalEffects.blur)
        }

        if (globalEffects.grain?.enabled) {

            this.applyGrain(globalEffects.grain.amount, globalEffects.grain.size)
        }

        if (globalEffects.noise?.enabled) {
            this.applyNoise(
                globalEffects.noise.intensity,
                globalEffects.noise.scale,
                globalEffects.noise.type
            )
        }

        if (globalEffects.halftone?.enabled) {
            this.applyHalftoneGradient(globalEffects.halftone)
        }

        if (globalEffects.metal?.enabled) {
            this.applyCorrugatedMetal(globalEffects.metal)
        }

        if (globalEffects.texture?.enabled) {
            this.applyTextureEffect(globalEffects.texture)
        }
    }


    // ---------------------------------------------------------------------------
    // Layer Rendering
    // ---------------------------------------------------------------------------
    private renderLayer(layer: GradientLayer, width: number, height: number): void {
        const ctx = this.ctx
        const { colors, transform, effects, blendMode, opacity } = layer

        // Skip if no colors
        if (colors.length < 2) return

        // Save context state
        ctx.save()

        // Apply blend mode
        ctx.globalCompositeOperation = this.mapBlendMode(blendMode)
        ctx.globalAlpha = opacity

        // Apply transform
        const centerX = width / 2
        const centerY = height / 2
        ctx.translate(centerX + transform.x * centerX, centerY + transform.y * centerY)
        ctx.rotate((transform.rotation * Math.PI) / 180)
        ctx.scale(transform.scale, transform.scale)
        ctx.translate(-centerX, -centerY)

        // Apply blur effect if enabled (via filter)
        if (effects.blur?.enabled && effects.blur.radius > 0) {
            ctx.filter = `blur(${effects.blur.radius}px)`
        }

        // Create and fill gradient
        const gradient = this.createGradient(layer, width, height)
        if (gradient) {
            ctx.fillStyle = gradient

            // Draw larger to accommodate blur
            const padding = effects.blur?.enabled ? effects.blur.radius * 2 : 0
            ctx.fillRect(-padding, -padding, width + padding * 2, height + padding * 2)
        }

        // Apply glow effect if enabled
        if (effects.glow?.enabled && effects.glow.intensity > 0) {
            this.applyGlow(layer, width, height, effects.glow.intensity, effects.glow.spread)
        }

        // Restore context state
        ctx.restore()
    }

    // ---------------------------------------------------------------------------
    // Gradient Creation
    // ---------------------------------------------------------------------------
    private createGradient(
        layer: GradientLayer,
        width: number,
        height: number
    ): CanvasGradient | null {
        const ctx = this.ctx
        const { type, colors } = layer

        let gradient: CanvasGradient

        switch (type) {
            case 'linear':
                // Vertical gradient by default
                gradient = ctx.createLinearGradient(0, 0, 0, height)
                break
            case 'radial':
                // Center radial gradient
                const centerX = width / 2
                const centerY = height / 2
                const radius = Math.max(width, height) / 2
                gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
                break
            case 'mesh':
                // Mesh gradients require WebGL, fall back to radial
                const cx = width / 2
                const cy = height / 2
                const r = Math.max(width, height) / 2
                gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
                break
            default:
                return null
        }

        // Add color stops
        for (const stop of colors) {
            gradient.addColorStop(stop.position, stop.color)
        }

        return gradient
    }

    // ---------------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------------
    private applyGlow(
        layer: GradientLayer,
        width: number,
        height: number,
        intensity: number,
        spread: number
    ): void {
        const ctx = this.ctx

        // Glow is achieved by drawing the gradient multiple times with decreasing opacity
        // and increasing blur
        ctx.save()
        ctx.globalCompositeOperation = 'screen'

        const glowLayers = 3
        for (let i = 0; i < glowLayers; i++) {
            const glowOpacity = intensity * (1 - i / glowLayers) * 0.3
            const glowBlur = spread * (i + 1) / glowLayers

            ctx.globalAlpha = glowOpacity
            ctx.filter = `blur(${glowBlur}px)`

            const gradient = this.createGradient(layer, width, height)
            if (gradient) {
                ctx.fillStyle = gradient
                ctx.fillRect(-spread, -spread, width + spread * 2, height + spread * 2)
            }
        }

        ctx.restore()
    }

    private applyGrain(amount: number, size: number): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // If size is 1, use pixel-perfext noise (original implementation)
        // If size > 1, render noise to a smaller canvas and upscale
        const scale = Math.max(1, size)

        // Dimensions for noise generation
        const noiseWidth = Math.ceil(width / scale)
        const noiseHeight = Math.ceil(height / scale)

        // Use offscreen canvas for noise generation
        const noiseCanvas = document.createElement('canvas')
        noiseCanvas.width = noiseWidth
        noiseCanvas.height = noiseHeight
        const noiseCtx = noiseCanvas.getContext('2d')
        if (!noiseCtx) return

        const imageData = noiseCtx.createImageData(noiseWidth, noiseHeight)
        const data = imageData.data
        const grainIntensity = amount * 50 // Scale to visible range

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * grainIntensity
            // Store noise in alpha channel or as gray value? 
            // Better to add noise directly to source? 
            // Since we're scaling, we need to overlay.
            // Let's make a gray noise layer with multiply/overlay blend

            // For simple additive noise like before, let's create a noise texture
            // centered around 128 (gray) and use 'overlay' or 'soft-light'

            // OR: Replicate the direct modification logic by drawing noise on top
            // The original logic modified RGB directly. 
            // To mimic that with scaling, we can draw a noise layer with 'overlay'

            const n = Math.random() * grainIntensity // 0 to amount*50
            const val = 128 + (Math.random() - 0.5) * grainIntensity * 2

            data[i] = val // R
            data[i + 1] = val // G
            data[i + 2] = val // B
            data[i + 3] = 255 // Alpha
        }

        noiseCtx.putImageData(imageData, 0, 0)

        // Draw noise canvas onto main canvas with 'overlay' blend mode
        ctx.save()
        // Improve scaling quality? 'pixelated' for chunky grain, 'high-quality' for soft
        ctx.imageSmoothingEnabled = false // Chunky grain
        ctx.globalCompositeOperation = 'overlay'
        // Reduce opacity slightly because overlay is strong
        ctx.globalAlpha = 0.8
        ctx.drawImage(noiseCanvas, 0, 0, width, height)
        ctx.restore()
    }

    private applyNoise(intensity: number, scale: number, type: 'perlin' | 'simplex' | 'random'): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // Create noise overlay using imageData
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        const noiseIntensity = intensity * 100

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4

                let noiseValue: number

                switch (type) {
                    case 'perlin':
                        // Simplified Perlin-like noise using sine waves
                        noiseValue = this.perlinNoise(x / scale, y / scale)
                        break
                    case 'simplex':
                        // Simplified Simplex-like noise
                        noiseValue = this.simplexNoise(x / scale, y / scale)
                        break
                    case 'random':
                    default:
                        // Pure random noise
                        noiseValue = Math.random() * 2 - 1
                        break
                }

                const noise = noiseValue * noiseIntensity

                // Apply noise to RGB channels
                data[i] = Math.max(0, Math.min(255, data[i] + noise))
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }

    // Simplified Perlin noise implementation
    private perlinNoise(x: number, y: number): number {
        const floorX = Math.floor(x)
        const floorY = Math.floor(y)
        const fracX = x - floorX
        const fracY = y - floorY

        // Smooth interpolation
        const sx = fracX * fracX * (3 - 2 * fracX)
        const sy = fracY * fracY * (3 - 2 * fracY)

        // Hash corners
        const n00 = this.hash2D(floorX, floorY)
        const n10 = this.hash2D(floorX + 1, floorY)
        const n01 = this.hash2D(floorX, floorY + 1)
        const n11 = this.hash2D(floorX + 1, floorY + 1)

        // Bilinear interpolation
        const nx0 = n00 + sx * (n10 - n00)
        const nx1 = n01 + sx * (n11 - n01)

        return nx0 + sy * (nx1 - nx0)
    }

    // Simplified Simplex noise implementation
    private simplexNoise(x: number, y: number): number {
        // Simplex skewing factors
        const F2 = 0.5 * (Math.sqrt(3) - 1)
        const G2 = (3 - Math.sqrt(3)) / 6

        const s = (x + y) * F2
        const i = Math.floor(x + s)
        const j = Math.floor(y + s)

        const t = (i + j) * G2
        const x0 = x - (i - t)
        const y0 = y - (j - t)

        // Determine which simplex we're in
        const i1 = x0 > y0 ? 1 : 0
        const j1 = x0 > y0 ? 0 : 1

        const x1 = x0 - i1 + G2
        const y1 = y0 - j1 + G2
        const x2 = x0 - 1 + 2 * G2
        const y2 = y0 - 1 + 2 * G2

        // Calculate contributions
        let n0 = 0, n1 = 0, n2 = 0

        let t0 = 0.5 - x0 * x0 - y0 * y0
        if (t0 > 0) {
            t0 *= t0
            n0 = t0 * t0 * this.hash2D(i, j)
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1
        if (t1 > 0) {
            t1 *= t1
            n1 = t1 * t1 * this.hash2D(i + i1, j + j1)
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2
        if (t2 > 0) {
            t2 *= t2
            n2 = t2 * t2 * this.hash2D(i + 1, j + 1)
        }

        return 70 * (n0 + n1 + n2)
    }

    // Simple 2D hash function
    private hash2D(x: number, y: number): number {
        let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
        return (n - Math.floor(n)) * 2 - 1
    }

    // ---------------------------------------------------------------------------
    // Halftone Gradient Overlay Effect
    // ---------------------------------------------------------------------------
    private applyHalftoneGradient(halftone: HalftoneGradientEffect): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height
        const { gradientPosition, sourceA, sourceB, blendMode, dotSizeMultiplier, contrastIntensity, noiseBlend, opacity } = halftone

        // Create offscreen canvas for halftone overlay
        const halftoneCanvas = document.createElement('canvas')
        halftoneCanvas.width = width
        halftoneCanvas.height = height
        const htCtx = halftoneCanvas.getContext('2d')
        if (!htCtx) return

        // Interpolate between source A and source B based on gradient position
        const interpolatedSource = this.interpolateHalftoneSources(sourceA, sourceB, gradientPosition)

        // Fill with interpolated base color
        htCtx.fillStyle = interpolatedSource.baseColor
        htCtx.fillRect(0, 0, width, height)

        // Determine pattern type based on gradient position
        // Closer to 0 = stochastic, closer to 1 = ordered
        const useOrderedPattern = gradientPosition > 0.5 ? interpolatedSource.patternType === 'ordered_halftone' : interpolatedSource.patternType === 'stochastic_halftone'

        if (useOrderedPattern || interpolatedSource.patternType === 'ordered_halftone') {
            this.drawOrderedHalftone(htCtx, width, height, interpolatedSource, dotSizeMultiplier, contrastIntensity, noiseBlend)
        } else {
            this.drawStochasticHalftone(htCtx, width, height, interpolatedSource, dotSizeMultiplier, contrastIntensity, noiseBlend)
        }

        // Apply halftone overlay with blend mode
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.globalCompositeOperation = this.mapHalftoneBlendMode(blendMode)
        ctx.drawImage(halftoneCanvas, 0, 0)
        ctx.restore()
    }

    private interpolateHalftoneSources(sourceA: HalftoneSource, sourceB: HalftoneSource, t: number): HalftoneSource {
        // Linear interpolation helper
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const lerpColor = (colorA: string, colorB: string, t: number): string => {
            const parseHex = (hex: string) => {
                const h = hex.replace('#', '')
                return {
                    r: parseInt(h.substring(0, 2), 16),
                    g: parseInt(h.substring(2, 4), 16),
                    b: parseInt(h.substring(4, 6), 16)
                }
            }
            const a = parseHex(colorA)
            const b = parseHex(colorB)
            const r = Math.round(lerp(a.r, b.r, t))
            const g = Math.round(lerp(a.g, b.g, t))
            const bVal = Math.round(lerp(a.b, b.b, t))
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bVal.toString(16).padStart(2, '0')}`
        }

        return {
            dotSizeRange: [
                lerp(sourceA.dotSizeRange[0], sourceB.dotSizeRange[0], t),
                lerp(sourceA.dotSizeRange[1], sourceB.dotSizeRange[1], t)
            ],
            dotDensity: t < 0.33 ? sourceA.dotDensity : t < 0.66 ? 'medium' : sourceB.dotDensity,
            contrast: t < 0.33 ? sourceA.contrast : t < 0.66 ? 'medium' : sourceB.contrast,
            noiseLevel: t < 0.33 ? sourceA.noiseLevel : t < 0.66 ? 'medium' : sourceB.noiseLevel,
            patternType: t < 0.5 ? sourceA.patternType : sourceB.patternType,
            baseColor: lerpColor(sourceA.baseColor, sourceB.baseColor, t),
            inkColor: lerpColor(sourceA.inkColor, sourceB.inkColor, t)
        }
    }

    private drawOrderedHalftone(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        source: HalftoneSource,
        sizeMultiplier: number,
        contrastIntensity: number,
        noiseBlend: number
    ): void {
        const [minDot, maxDot] = source.dotSizeRange
        const avgDotSize = ((minDot + maxDot) / 2) * sizeMultiplier

        // Grid spacing based on density
        const densityMap = { low: 2.5, medium: 1.8, high: 1.2 }
        const spacing = avgDotSize * (densityMap[source.dotDensity] || 1.8)

        ctx.fillStyle = source.inkColor

        for (let y = spacing / 2; y < height; y += spacing) {
            for (let x = spacing / 2; x < width; x += spacing) {
                // Add slight noise to position for organic feel
                const noiseOffsetX = noiseBlend * (Math.random() - 0.5) * spacing * 0.3
                const noiseOffsetY = noiseBlend * (Math.random() - 0.5) * spacing * 0.3

                // Size variation based on contrast
                const sizeVariation = 1 + (contrastIntensity * (Math.random() - 0.5) * 0.5)
                const dotSize = avgDotSize * sizeVariation * sizeMultiplier

                ctx.beginPath()
                ctx.arc(x + noiseOffsetX, y + noiseOffsetY, Math.max(0.5, dotSize / 2), 0, Math.PI * 2)
                ctx.fill()
            }
        }
    }

    private drawStochasticHalftone(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        source: HalftoneSource,
        sizeMultiplier: number,
        contrastIntensity: number,
        noiseBlend: number
    ): void {
        const [minDot, maxDot] = source.dotSizeRange

        // Number of dots based on density
        const densityMap = { low: 0.0005, medium: 0.001, high: 0.002 }
        const dotCount = Math.floor(width * height * (densityMap[source.dotDensity] || 0.001))

        ctx.fillStyle = source.inkColor

        for (let i = 0; i < dotCount; i++) {
            const x = Math.random() * width
            const y = Math.random() * height

            // Size varies based on noise blend and contrast
            const baseSize = minDot + Math.random() * (maxDot - minDot)
            const contrastMod = 1 + (contrastIntensity * (Math.random() - 0.5))
            const noiseMod = 1 + (noiseBlend * this.hash2D(x * 0.1, y * 0.1) * 0.3)
            const dotSize = baseSize * sizeMultiplier * contrastMod * noiseMod

            ctx.beginPath()
            ctx.arc(x, y, Math.max(0.3, dotSize / 2), 0, Math.PI * 2)
            ctx.fill()
        }
    }

    private mapHalftoneBlendMode(blendMode: HalftoneBlendMode): GlobalCompositeOperation {
        const blendModeMap: Record<HalftoneBlendMode, GlobalCompositeOperation> = {
            'multiply': 'multiply',
            'overlay': 'overlay',
            'soft-light': 'soft-light',
            'hard-light': 'hard-light',
        }
        return blendModeMap[blendMode] || 'overlay'
    }

    // ---------------------------------------------------------------------------
    // Corrugated Metal Overlay Effect
    // ---------------------------------------------------------------------------
    private applyCorrugatedMetal(metal: CorrugatedMetalEffect): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height
        const { distortion, macroShading, microContrast, density, angle = 0, opacity, blendMode } = metal

        // Create offscreen canvas for metal overlay
        const metalCanvas = document.createElement('canvas')
        metalCanvas.width = width
        metalCanvas.height = height
        const mCtx = metalCanvas.getContext('2d')
        if (!mCtx) return

        // 1. Generate Ridge Pattern
        const imageData = mCtx.createImageData(width, height)
        const data = imageData.data

        // Pre-calculate constants for performance
        const waveFreq = 0.02 * (1 + distortion * 2) // Wave frequency increases with distortion
        const amp = distortion * 20 // Distortion amplitude
        const ridgeScale = density / 10 // Map density to frequency multiplier

        // Calculate rotation
        const rad = (angle * Math.PI) / 180
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4

                // Rotate coordinates
                // u moves perpendicular to ridges (across them)
                // v moves parallel to ridges (along them)
                const u = x * cos + y * sin
                const v = -x * sin + y * cos

                // Calculate ridge value based on rotated coordinates
                // Use v for wave offset (along the ridge)
                // Use u for the main ridge pattern (across the ridge)
                const waveOffset = Math.sin(v * waveFreq) * amp
                const ridgeVal = Math.sin((u + waveOffset) * ridgeScale)

                // Apply micro-contrast (shine)
                // Map -1..1 to 0..1, then power function for sharpness
                let normalized = (ridgeVal + 1) / 2

                // Enhance peaks for metallic shine based on microContrast
                // High contrast = sharper peaks (power > 1)
                const contrastPower = 1 + microContrast * 3
                normalized = Math.pow(normalized, contrastPower)

                const val = Math.floor(normalized * 255)

                data[i] = val     // R
                data[i + 1] = val // G
                data[i + 2] = val // B
                data[i + 3] = 255 // Alpha
            }
        }

        mCtx.putImageData(imageData, 0, 0)

        // 2. Apply Macro Shading (Vignette/Lighting)
        mCtx.save()
        mCtx.globalCompositeOperation = 'multiply' // Blend shading onto ridges

        const shadingIntensity = macroShading.intensity
        let shadeGradient: CanvasGradient

        if (macroShading.style === 'soft_diagonal') {
            // Diagonal fade: Light top-left to Dark bottom-right
            shadeGradient = mCtx.createLinearGradient(0, 0, width, height)
            shadeGradient.addColorStop(0, `rgba(255, 255, 255, ${1 - shadingIntensity * 0.5})`) // Hilite
            shadeGradient.addColorStop(0.5, `rgba(128, 128, 128, 0.5)`) // Mid
            shadeGradient.addColorStop(1, `rgba(0, 0, 0, ${shadingIntensity})`) // Shadow
        } else {
            // Strong Horizontal: Fade from detailed left to obscured right
            shadeGradient = mCtx.createLinearGradient(0, 0, width, 0)
            shadeGradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`)
            shadeGradient.addColorStop(0.4, `rgba(128, 128, 128, 0.5)`)
            shadeGradient.addColorStop(1, `rgba(0, 0, 0, ${shadingIntensity * 1.2})`) // Deep shadow
        }

        mCtx.fillStyle = shadeGradient
        mCtx.fillRect(0, 0, width, height)
        mCtx.restore()

        // 3. Composite onto Main Canvas
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.globalCompositeOperation = this.mapMetalBlendMode(blendMode)
        ctx.drawImage(metalCanvas, 0, 0)
        ctx.restore()
    }

    private mapMetalBlendMode(blendMode: MetalBlendMode): GlobalCompositeOperation {
        const blendModeMap: Record<MetalBlendMode, GlobalCompositeOperation> = {
            'overlay': 'overlay',
            'soft-light': 'soft-light',
            'hard-light': 'hard-light',
            'luminosity': 'luminosity',
        }
        return blendModeMap[blendMode] || 'overlay'
    }




    // ---------------------------------------------------------------------------
    // Global Procedural Texture Effect
    // ---------------------------------------------------------------------------
    private applyTextureEffect(texture: TextureEffect): void {
        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height
        const { presetId, opacity, blendMode, scale } = texture

        // Find preset data
        const preset = textureData.global_effect_texture.textures.find(t => t.id === presetId)
        if (!preset) return

        // Create offscreen canvas for texture
        const texCanvas = document.createElement('canvas')
        texCanvas.width = width
        texCanvas.height = height
        const texCtx = texCanvas.getContext('2d')
        if (!texCtx) return

        // -----------------------------------------------------------------------
        // RENDER PRESET BASED ON ID
        // -----------------------------------------------------------------------
        switch (presetId) {
            case 'frosted_glass_smooth_001':
                this.renderFrostedGlass(texCtx, width, height, scale)
                break
            case 'brushed_metal_granular_001':
                this.renderBrushedMetal(texCtx, width, height, scale)
                break
            case 'rippled_water_reflective_001':
                this.renderRippledWater(texCtx, width, height, scale)
                break
            default:
                // Fallback for unknown IDs, try to infer from properties
                if (preset.properties.type === 'diffusion') {
                    this.renderFrostedGlass(texCtx, width, height, scale)
                } else if (preset.properties.type === 'granular') {
                    this.renderBrushedMetal(texCtx, width, height, scale)
                } else {
                    this.renderRippledWater(texCtx, width, height, scale)
                }
                break
        }

        // Composite texture onto main canvas
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.globalCompositeOperation = this.mapBlendMode(blendMode)
        ctx.drawImage(texCanvas, 0, 0)
        ctx.restore()
    }

    // --- Procedural Generators ---

    private renderFrostedGlass(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
        // Soft gradient background (Light Gray to Dark Gray)
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#f0f0f0')
        gradient.addColorStop(1, '#808080')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Heavy high-frequency noise for "frost"
        // Scale determines the "size" of the frost granules.
        // Higher scale = larger granules.
        // We generate noise at a smaller resolution and upscale it.

        const noiseScale = Math.max(1, scale) // Ensure at least 1
        const noiseW = Math.ceil(width / noiseScale)
        const noiseH = Math.ceil(height / noiseScale)

        const noiseCanvas = document.createElement('canvas')
        noiseCanvas.width = noiseW
        noiseCanvas.height = noiseH
        const noiseCtx = noiseCanvas.getContext('2d')
        if (!noiseCtx) return

        const imageData = noiseCtx.getImageData(0, 0, noiseW, noiseH)
        const data = imageData.data
        const noiseFactor = 40 // Adjust intensity

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseFactor
            // We want a noise layer, not modifying the gradient directly which is on 'ctx'
            // So we make a transparent/gray noise layer to overlay?
            // Original code modified the background gradient directly.
            // Let's create a grayscale noise layer and draw it.

            const val = 128 + (Math.random() - 0.5) * noiseFactor * 2

            data[i] = val
            data[i + 1] = val
            data[i + 2] = val
            data[i + 3] = 255 // Opaque noise on this temp canvas
        }
        noiseCtx.putImageData(imageData, 0, 0)

        // Composite scaled noise onto background
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.imageSmoothingEnabled = false // Keep it rough/frosted
        ctx.drawImage(noiseCanvas, 0, 0, width, height)
        ctx.restore()

        // Optional: Apply a blur to soften the grain into "diffusion"
        // We can apply blur to the ctx directly now
        // BUT typical canvas blur is slow.
        // Actually, 'frosted glass' usually implies interaction with what's BEHIND it (backdrop-filter).
        // Since we are a texture overlay, we simulate the look of the surface itself.
    }

    private renderBrushedMetal(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
        // Brushed metal is unidirectional noise
        // Directional top-right (diagonal?) or horizontal?
        // JSON says "light_source": "directional_top_right", "gradient_type": "linear"
        // Let's do a diagonal brush texture

        // 1. Base metallic gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#e0e0e0')
        gradient.addColorStop(0.5, '#a0a0a0')
        gradient.addColorStop(1, '#606060')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // 2. Unidirectional noise streaks
        // To do diagonal streaks efficiently: generate a 1D noise strip and stretch/rotate it?
        // OR pixel-wise:
        // x' = x cos a + y sin a
        // noise(x') -> value is same along lines perpendicular to direction

        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        const angle = Math.PI / 4 // 45 degrees
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const intensity = 30

        // Pre-compute noise lookup table for performance?
        // Or just map coordinates.
        // Let's use a 1D noise buffer to sample from for streaks
        // Length enough to cover diagonal: sqrt(w^2 + h^2)
        const maxDim = Math.sqrt(width * width + height * height)
        const noiseValues = new Uint8Array(Math.ceil(maxDim * 2)) // *2 just to be safe with offsets
        for (let k = 0; k < noiseValues.length; k++) {
            noiseValues[k] = Math.random() * 255
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Coordinate projection along the streak direction
                const u = x * cos + y * sin
                // Map u to index in noise array. 
                // Scaling 'u' changes streak frequency.
                const noiseIndex = Math.floor(Math.abs(u) * (1 / scale) * 2) % noiseValues.length

                const noiseVal = (noiseValues[noiseIndex] / 255 - 0.5) * intensity

                // Add some high-frequency speckle (granular) on top
                const speckle = (Math.random() - 0.5) * 10

                const totalNoise = noiseVal + speckle

                const i = (y * width + x) * 4
                data[i] = Math.max(0, Math.min(255, data[i] + totalNoise))
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + totalNoise))
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + totalNoise))
            }
        }
        ctx.putImageData(imageData, 0, 0)
    }

    private renderRippledWater(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
        // Complex high-contrast organic pattern
        // Using our existing Simplex noise implementation but with domain warping or phases

        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        // Settings for "Rippled Water"
        // High contrast, organic loops
        const noiseScale = 80 * scale

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Determine brightness based on noise
                // We'll use turbulence: sum of abs(noise) layers?
                // Or just a simple distorted sine wave pattern: sin(x + noise(y))

                const nx = x / noiseScale
                const ny = y / noiseScale

                // Base noise for distortion
                const distortion = this.simplexNoise(nx, ny) * 2 // -2 to 2

                // Use distortion to drive a sine wave pattern for "ripples"
                // Ripples implies concentric or wavy lines
                // val = sin(distance + distortion)

                const val = Math.sin(nx * 5 + distortion * 3)
                // Map -1..1 to 0..255

                // High contrast curve
                const c = (val + 1) / 2
                // Apply a power curve for sharper highlights "reflective"
                const reflective = Math.pow(c, 3)

                const pixelVal = Math.floor(reflective * 255)

                const i = (y * width + x) * 4
                data[i] = pixelVal
                data[i + 1] = pixelVal
                data[i + 2] = pixelVal
                data[i + 3] = 255 // Alpha needs to be opaque so we can blend later? 
                // Actually, logic for texture overlay usually assumes opaque texture + alpha/blendmode
            }
        }

        ctx.putImageData(imageData, 0, 0)

        // Colorize or leave grayscale? Description says "monochrome"
    }

    // ---------------------------------------------------------------------------
    // Utilities
    // ---------------------------------------------------------------------------
    private applyGlobalBlur(blur: GlobalBlurEffect): void {
        const { strength } = blur
        if (strength <= 0) return

        const ctx = this.ctx
        const width = this.canvas.width
        const height = this.canvas.height

        // Fix white vignette/halo at edges by "clamping" to edge
        // We create a larger temporary canvas, draw the content in the center,
        // and replicate the edges in the padding area.
        const padding = Math.min(width, Math.min(height, Math.ceil(strength * 2))) // Limit padding to avoid massive canvases

        const tempCanvas = document.createElement('canvas')
        const paddedWidth = width + (padding * 2)
        const paddedHeight = height + (padding * 2)

        tempCanvas.width = paddedWidth
        tempCanvas.height = paddedHeight

        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) return

        // 1. Draw center (original content)
        tempCtx.drawImage(this.canvas, padding, padding)

        // 2. Draw extended edges (Clamp)
        // Top Edge
        tempCtx.drawImage(this.canvas, 0, 0, width, 1, padding, 0, width, padding)
        // Bottom Edge
        tempCtx.drawImage(this.canvas, 0, height - 1, width, 1, padding, height + padding, width, padding)
        // Left Edge
        tempCtx.drawImage(this.canvas, 0, 0, 1, height, 0, padding, padding, height)
        // Right Edge
        tempCtx.drawImage(this.canvas, width - 1, 0, 1, height, width + padding, padding, padding, height)

        // 3. Draw Corners
        // Top-Left
        tempCtx.drawImage(this.canvas, 0, 0, 1, 1, 0, 0, padding, padding)
        // Top-Right
        tempCtx.drawImage(this.canvas, width - 1, 0, 1, 1, width + padding, 0, padding, padding)
        // Bottom-Right
        tempCtx.drawImage(this.canvas, width - 1, height - 1, 1, 1, width + padding, height + padding, padding, padding)
        // Bottom-Left
        tempCtx.drawImage(this.canvas, 0, height - 1, 1, 1, 0, height + padding, padding, padding)

        // 4. Apply blur and draw back
        ctx.save()
        // Use copy to completely replace the unblurred content
        ctx.globalCompositeOperation = 'copy'
        ctx.filter = `blur(${strength}px)`
        // Draw centered, cropping out the padding
        ctx.drawImage(tempCanvas, -padding, -padding)
        ctx.restore()
    }

    private mapBlendMode(blendMode: BlendMode): GlobalCompositeOperation {

        const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
            'normal': 'source-over',
            'multiply': 'multiply',
            'screen': 'screen',
            'overlay': 'overlay',
            'soft-light': 'soft-light',
            'hard-light': 'hard-light',
            'color-dodge': 'color-dodge',
            'color-burn': 'color-burn',
        }
        return blendModeMap[blendMode] || 'source-over'
    }

}
