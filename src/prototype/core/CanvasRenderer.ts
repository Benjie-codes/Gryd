import { GrydComposition, GradientLayer, BlendMode } from '../types'

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

        // Create grain using imageData for better performance
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        const grainIntensity = amount * 50 // Scale to visible range

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * grainIntensity
            data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
        }

        ctx.putImageData(imageData, 0, 0)
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
    // Utilities
    // ---------------------------------------------------------------------------
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
