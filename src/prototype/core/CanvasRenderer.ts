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
