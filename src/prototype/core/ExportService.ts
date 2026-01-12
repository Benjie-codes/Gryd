// =============================================================================
// GRYD Export Service
// Handles PNG/JPG image export and CSS gradient generation
// =============================================================================

import { GrydComposition, GradientLayer, GradientColorStop, BlendMode } from '../types'

import { CanvasRenderer } from './CanvasRenderer'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type ImageFormat = 'png' | 'jpeg'
export type ImageResolution = '2k' | '4k' | '8k'
export type ColorFormat = 'hex' | 'rgb' | 'hsl'
export type AspectRatio = 'square' | '16:9' | '9:16'

export interface ExportImageOptions {
    format: ImageFormat
    resolution: ImageResolution
    aspectRatio?: AspectRatio
    quality?: number // 0-1 for JPEG
}

export interface ExportCSSOptions {
    colorFormat: ColorFormat
    minified: boolean
    includeFilters: boolean
}

// -----------------------------------------------------------------------------
// Resolution Mapping
// -----------------------------------------------------------------------------
const RESOLUTIONS: Record<ImageResolution, number> = {
    '2k': 2048,
    '4k': 4096,
    '8k': 8192,
}

const ASPECT_RATIOS: Record<AspectRatio, { width: number; height: number }> = {
    'square': { width: 1, height: 1 },
    '16:9': { width: 16, height: 9 },
    '9:16': { width: 9, height: 16 },
}

// -----------------------------------------------------------------------------
// Export Service
// -----------------------------------------------------------------------------
export class ExportService {
    // -------------------------------------------------------------------------
    // Image Export
    // -------------------------------------------------------------------------
    static async exportImage(
        composition: GrydComposition,
        options: ExportImageOptions
    ): Promise<Blob> {
        const { format, resolution, aspectRatio = 'square', quality = 0.92 } = options

        // Calculate dimensions
        const baseSize = RESOLUTIONS[resolution]
        const ratio = ASPECT_RATIOS[aspectRatio]
        let width: number
        let height: number

        if (ratio.width >= ratio.height) {
            width = baseSize
            height = Math.round(baseSize * (ratio.height / ratio.width))
        } else {
            height = baseSize
            width = Math.round(baseSize * (ratio.width / ratio.height))
        }

        // Create offscreen canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // Calculate scale factor based on original composition size vs export size
        // This ensures effects like blur maintain their visual appearance
        const originalSize = Math.max(composition.canvas.width, composition.canvas.height)
        const exportSize = Math.max(width, height)
        const scaleFactor = exportSize / originalSize

        // Create scaled composition with adjusted effect values
        const scaledLayers = composition.layers.map(layer => ({
            ...layer,
            effects: {
                ...layer.effects,
                blur: layer.effects.blur ? {
                    ...layer.effects.blur,
                    radius: layer.effects.blur.radius * scaleFactor,
                } : undefined,
                glow: layer.effects.glow ? {
                    ...layer.effects.glow,
                    spread: layer.effects.glow.spread * scaleFactor,
                } : undefined,
            },
        }))

        // Scale global effects as well
        const scaledGlobalEffects = {
            ...composition.globalEffects,
            blur: composition.globalEffects.blur ? {
                ...composition.globalEffects.blur,
                strength: composition.globalEffects.blur.strength * scaleFactor,
            } : {
                enabled: false,
                strength: 0,
            },
            noise: {

                ...composition.globalEffects.noise,
                scale: composition.globalEffects.noise.scale * scaleFactor,
            },
            grain: {
                ...composition.globalEffects.grain,
                size: composition.globalEffects.grain.size * scaleFactor,
            },
            metal: {
                ...composition.globalEffects.metal,
                density: composition.globalEffects.metal.density / scaleFactor,
            },
            texture: composition.globalEffects.texture ? {
                ...composition.globalEffects.texture,
                scale: composition.globalEffects.texture.scale * scaleFactor,
            } : {
                enabled: false,
                presetId: 'frosted_glass_smooth_001',
                opacity: 0.5,
                blendMode: 'overlay' as BlendMode,
                scale: 1 * scaleFactor,
            },
            halftone: composition.globalEffects.halftone ? {
                ...composition.globalEffects.halftone,
                // Scale dot size multiplier to maintain relative size
                dotSizeMultiplier: composition.globalEffects.halftone.dotSizeMultiplier * scaleFactor,
            } : {
                enabled: false,
                gradientPosition: 0.5,
                sourceA: {
                    dotSizeRange: [2, 8] as [number, number],
                    dotDensity: 'medium' as const,
                    contrast: 'medium' as const,
                    noiseLevel: 'medium' as const,
                    patternType: 'ordered_halftone' as const,
                    baseColor: '#ffffff',
                    inkColor: '#000000',
                },

                sourceB: {
                    dotSizeRange: [4, 12] as [number, number],
                    dotDensity: 'medium' as const,
                    contrast: 'medium' as const,
                    noiseLevel: 'medium' as const,
                    patternType: 'stochastic_halftone' as const,
                    baseColor: '#ffffff',
                    inkColor: '#000000',
                },

                blendMode: 'overlay' as const,

                dotSizeMultiplier: 1,
                contrastIntensity: 1,
                noiseBlend: 0.2,
                opacity: 0.8,
            },
        }



        // Create renderer
        const renderer = new CanvasRenderer(canvas)
        const exportComposition: GrydComposition = {
            ...composition,
            canvas: {
                ...composition.canvas,
                width,
                height,
            },
            layers: scaledLayers,
            globalEffects: scaledGlobalEffects,
        }

        renderer.render(exportComposition)

        // Convert to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to create image blob'))
                    }
                },
                `image/${format}`,
                format === 'jpeg' ? quality : undefined
            )
        })
    }

    static async downloadImage(
        composition: GrydComposition,
        options: ExportImageOptions,
        filename?: string
    ): Promise<void> {
        const blob = await this.exportImage(composition, options)
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename || `gryd-gradient-${options.resolution}.${options.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Delay revoking the URL to ensure the browser has time to process the download
        // Immediate revocation can cause the file to be saved with the blob UUID as filename
        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 150)
    }

    // -------------------------------------------------------------------------
    // CSS Export
    // -------------------------------------------------------------------------
    static generateCSS(
        composition: GrydComposition,
        options: ExportCSSOptions
    ): string {
        const { colorFormat, minified, includeFilters } = options
        const { layers, canvas, globalEffects } = composition

        const visibleLayers = layers.filter(l => l.visible)
        const gradients: string[] = []
        const filters: string[] = []

        // Generate gradients for each layer
        for (const layer of visibleLayers) {
            const gradient = this.layerToCSS(layer, colorFormat)
            if (gradient) {
                gradients.push(gradient)
            }
        }

        // Build CSS
        const nl = minified ? '' : '\n'
        const indent = minified ? '' : '  '
        const space = minified ? '' : ' '

        let css = `.gryd-gradient${space}{${nl}`

        // Background color
        const bgColor = this.formatColor(canvas.backgroundColor, colorFormat)
        css += `${indent}background-color:${space}${bgColor};${nl}`

        // Stacked gradients
        if (gradients.length > 0) {
            css += `${indent}background-image:${space}${nl}`
            css += gradients.map((g, i) =>
                `${indent}${indent}${g}${i < gradients.length - 1 ? ',' : ';'}`
            ).join(nl)
            css += nl
        }

        // Filters
        if (includeFilters) {
            const filterParts: string[] = []

            // Check for blur on first layer
            const primaryLayer = visibleLayers[0]
            if (primaryLayer?.effects.blur?.enabled && primaryLayer.effects.blur.radius > 0) {
                filterParts.push(`blur(${Math.round(primaryLayer.effects.blur.radius / 4)}px)`)
            }

            // Global grain effect note
            if (globalEffects.grain?.enabled) {
                css += `${indent}/* Note: Grain effect requires SVG noise filter */${nl}`
            }

            if (filterParts.length > 0) {
                filters.push(...filterParts)
                css += `${indent}filter:${space}${filters.join(' ')};${nl}`
            }
        }

        css += `}`

        return css
    }

    private static layerToCSS(layer: GradientLayer, colorFormat: ColorFormat): string | null {
        const { type, colors, opacity } = layer

        if (colors.length < 2) return null

        const colorStops = colors
            .map(stop => {
                const color = this.formatColor(stop.color, colorFormat, opacity)
                const position = Math.round(stop.position * 100)
                return `${color} ${position}%`
            })
            .join(', ')

        switch (type) {
            case 'linear':
                return `linear-gradient(180deg, ${colorStops})`
            case 'radial':
                return `radial-gradient(circle at center, ${colorStops})`
            case 'mesh':
                // Mesh approximated as radial
                return `radial-gradient(ellipse at center, ${colorStops})`
            default:
                return null
        }
    }

    private static formatColor(
        color: string,
        format: ColorFormat,
        opacity: number = 1
    ): string {
        // Parse hex color
        const hex = color.startsWith('#') ? color : '#000000'
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)

        switch (format) {
            case 'hex':
                if (opacity < 1) {
                    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
                    return `${hex}${alpha}`
                }
                return hex

            case 'rgb':
                if (opacity < 1) {
                    return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`
                }
                return `rgb(${r}, ${g}, ${b})`

            case 'hsl':
                const { h, s, l } = this.rgbToHsl(r, g, b)
                if (opacity < 1) {
                    return `hsla(${h}, ${s}%, ${l}%, ${opacity.toFixed(2)})`
                }
                return `hsl(${h}, ${s}%, ${l}%)`

            default:
                return hex
        }
    }

    private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0
        let s = 0
        const l = (max + min) / 2

        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                    break
                case g:
                    h = ((b - r) / d + 2) / 6
                    break
                case b:
                    h = ((r - g) / d + 4) / 6
                    break
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        }
    }

    // -------------------------------------------------------------------------
    // Clipboard
    // -------------------------------------------------------------------------
    static async copyToClipboard(text: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (err) {
            console.error('Failed to copy to clipboard:', err)
            return false
        }
    }
}
