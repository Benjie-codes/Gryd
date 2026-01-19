import React from 'react'
import { useGrydStore } from '../prototype/store/compositionStore'
import { GradientLayer, GradientColorStop, BlendMode } from '../prototype/types'

/**
 * StaticFallbackCanvas
 * 
 * Failsafe renderer that uses simple HTML/CSS to approximate the composition.
 * Used when the main Canvas pipeline fails to initialize or crashes.
 * 
 * Capabilities:
 * - Renders Background Color
 * - Renders Layers (Linear/Radial)
 * - Approximates Transforms (CSS transform)
 * - Approximates Blending (CSS mix-blend-mode)
 * 
 * Limitations (By Design):
 * - No Blur/Glow/Noise/Grain effects
 * - No Mesh Gradients (fall back to center radial)
 */

interface StaticFallbackCanvasProps {
    className?: string
}

export const StaticFallbackCanvas: React.FC<StaticFallbackCanvasProps> = ({ className }) => {
    const composition = useGrydStore((state) => state.composition)
    const { canvas, layers } = composition

    return (
        <div
            className={`relative overflow-hidden ${className || ''}`}
            style={{ backgroundColor: canvas.backgroundColor }}
        >
            {/* Render layers in order */}
            {layers.map((layer) => (
                <CSSLayer key={layer.id} layer={layer} width={canvas.width} height={canvas.height} />
            ))}

            {/* Overlay a warning or indicator that we are in fallback mode? 
                Requirements say "Static gradient preview fallback" - implies just the visual.
            */}
        </div>
    )
}

const CSSLayer: React.FC<{ layer: GradientLayer; width: number; height: number }> = ({ layer, width, height }) => {
    if (!layer.visible) return null

    const { type, colors, transform, opacity, blendMode } = layer

    // 1. Build Gradient String
    let backgroundString = ''
    const sortedStops = [...colors].sort((a, b) => a.position - b.position)
    const stopsString = sortedStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')

    if (type === 'linear') {
        // Vertical by default in data model if no angle specified (usually angle is in specific linear params, 
        // but here we just have transform rotation).
        backgroundString = `linear-gradient(to bottom, ${stopsString})`
    } else {
        // Radial/Mesh -> Radial
        backgroundString = `radial-gradient(circle at center, ${stopsString})`
    }

    // 2. Build Transform
    // CSS transforms origin is center by default on divs if we center them.
    // Our layer transform: x/y are -1 to 1 offsets from center.
    // rotation is degrees.
    // scale is multiplier.

    // We render a div that matches the canvas aspect ratio or fills parent?
    // Usually layers fill the canvas.
    // translate(x%?, y%?)
    // x=1 means offset by half width?
    const tx = transform.x * 50 // % relative to width? type def says "-1 -> 1 (offset from center)"
    const ty = transform.y * 50

    const transformString = `
        translate(${tx}%, ${ty}%)
        rotate(${transform.rotation}deg)
        scale(${transform.scale})
    `

    // 3. Map Blend Mode
    // CSS mix-blend-mode matches most Canvas blend modes
    // sanitize blend mode in case of mismatch types
    const mixBlendMode = (blendMode as any) === 'normal' ? 'normal' : blendMode

    return (
        <div
            className="absolute inset-0 w-full h-full"
            style={{
                background: backgroundString,
                opacity: opacity,
                mixBlendMode: mixBlendMode as any,
                transform: transformString,
                transformOrigin: 'center center',
            }}
        />
    )
}
