// =============================================================================
// GRYD Gradient Generator
// Procedural generation engine for Discovery Mode
// =============================================================================

import {
    GrydComposition,
    GradientLayer,
    GradientColorStop,
    BlendMode,
    createDefaultEffects,
    createDefaultGlobalEffects,
    HalftoneGradientEffect,
    CorrugatedMetalEffect,
    TextureOverlayEffect,

} from '../types'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type GradientArchetype =
    | 'light-melt'      // Extreme blur + harmony, ethereal
    | 'structural-stack' // Layered shapes with defined edges
    | 'aurora'          // Northern lights, flowing colors
    | 'sunset'          // Warm oranges, pinks, purples
    | 'ocean'           // Deep blues, teals, cyan
    | 'neon'            // Vibrant, high contrast
    | 'earth'           // Natural browns, greens, warm
    | 'random'          // Pure randomness

export interface GeneratorOptions {
    archetype?: GradientArchetype
    seed?: string
    layerCount?: number
    width?: number
    height?: number
}

// -----------------------------------------------------------------------------
// Seeded Random Number Generator
// Mulberry32 algorithm for deterministic randomness
// -----------------------------------------------------------------------------
class SeededRandom {
    private seed: number

    constructor(seed: string | number) {
        this.seed = typeof seed === 'string' ? this.hashCode(seed) : seed
    }

    private hashCode(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return Math.abs(hash)
    }

    next(): number {
        let t = this.seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min
    }

    pick<T>(array: T[]): T {
        return array[Math.floor(this.next() * array.length)]
    }

    shuffle<T>(array: T[]): T[] {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1))
                ;[result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }
}

// -----------------------------------------------------------------------------
// Color Palettes by Archetype
// -----------------------------------------------------------------------------
const COLOR_PALETTES: Record<GradientArchetype, string[][]> = {
    'light-melt': [
        ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'],
        ['#fdf4ff', '#fae8ff', '#f5d0fe', '#e879f9', '#d946ef'],
        ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80'],
    ],
    'structural-stack': [
        ['#0a0a0a', '#1a1a1a', '#3a3a3a', '#22c55e', '#10b981'],
        ['#0f172a', '#1e293b', '#334155', '#6366f1', '#818cf8'],
        ['#18181b', '#27272a', '#3f3f46', '#f59e0b', '#fbbf24'],
    ],
    'aurora': [
        ['#0f172a', '#22d3ee', '#34d399', '#a78bfa', '#f472b6'],
        ['#020617', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899'],
        ['#0c0a09', '#22c55e', '#3b82f6', '#a855f7', '#f43f5e'],
    ],
    'sunset': [
        ['#1e1b4b', '#4c1d95', '#c026d3', '#f472b6', '#fbbf24'],
        ['#18181b', '#7c2d12', '#ea580c', '#fb923c', '#fef3c7'],
        ['#0f172a', '#831843', '#db2777', '#f472b6', '#fce7f3'],
    ],
    'ocean': [
        ['#0c4a6e', '#0369a1', '#0891b2', '#22d3ee', '#67e8f9'],
        ['#0f172a', '#164e63', '#0e7490', '#06b6d4', '#a5f3fc'],
        ['#020617', '#0f766e', '#14b8a6', '#2dd4bf', '#99f6e4'],
    ],
    'neon': [
        ['#0a0a0a', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9'],
        ['#0a0a0a', '#f43f5e', '#ec4899', '#d946ef', '#a855f7'],
        ['#0a0a0a', '#fbbf24', '#f59e0b', '#22c55e', '#06b6d4'],
    ],
    'earth': [
        ['#1c1917', '#44403c', '#78716c', '#a8a29e', '#fef3c7'],
        ['#1c1917', '#365314', '#4d7c0f', '#84cc16', '#d9f99d'],
        ['#0c0a09', '#451a03', '#78350f', '#b45309', '#fcd34d'],
    ],
    'random': [
        ['#0a0a0a', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
    ],
}

// -----------------------------------------------------------------------------
// Blend Mode Sets by Archetype
// -----------------------------------------------------------------------------
const BLEND_MODES_BY_ARCHETYPE: Record<GradientArchetype, BlendMode[]> = {
    'light-melt': ['screen', 'soft-light', 'overlay'],
    'structural-stack': ['normal', 'multiply', 'hard-light'],
    'aurora': ['screen', 'color-dodge', 'soft-light'],
    'sunset': ['screen', 'soft-light', 'overlay'],
    'ocean': ['multiply', 'soft-light', 'screen'],
    'neon': ['screen', 'color-dodge', 'hard-light'],
    'earth': ['multiply', 'soft-light', 'normal'],
    'random': ['normal', 'screen', 'multiply', 'overlay', 'soft-light'],
}

// -----------------------------------------------------------------------------
// Generator Class
// -----------------------------------------------------------------------------
export class GradientGenerator {
    private rng: SeededRandom
    private seed: string

    constructor(seed?: string) {
        this.seed = seed || this.generateSeed()
        this.rng = new SeededRandom(this.seed)
    }

    private generateSeed(): string {
        return `gryd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    }

    getSeed(): string {
        return this.seed
    }

    // -------------------------------------------------------------------------
    // Color Generation
    // -------------------------------------------------------------------------
    private generateColorStops(palette: string[], count: number): GradientColorStop[] {
        const colors = this.rng.shuffle(palette).slice(0, count)
        const stops: GradientColorStop[] = []

        for (let i = 0; i < colors.length; i++) {
            stops.push({
                id: crypto.randomUUID(),
                color: colors[i],
                position: i / (colors.length - 1),
            })
        }

        return stops
    }

    private generateRandomColor(): string {
        const h = this.rng.nextInt(0, 360)
        const s = this.rng.nextInt(40, 90)
        const l = this.rng.nextInt(30, 70)
        return `hsl(${h}, ${s}%, ${l}%)`
    }

    // -------------------------------------------------------------------------
    // Layer Generation
    // -------------------------------------------------------------------------
    private generateLayer(
        name: string,
        archetype: GradientArchetype,
        palette: string[],
        index: number,
        totalLayers: number
    ): GradientLayer {
        const isFirstLayer = index === 0
        const colorCount = this.rng.nextInt(2, 4)
        const colors = this.generateColorStops(palette, colorCount)

        // Determine gradient type
        const types: Array<'linear' | 'radial'> = ['linear', 'radial']
        const type = this.rng.pick(types)

        // Generate transform with variation
        const transform = {
            x: isFirstLayer ? 0 : (this.rng.next() - 0.5) * 1.5,
            y: isFirstLayer ? 0 : (this.rng.next() - 0.5) * 1.5,
            scale: isFirstLayer ? 1.2 : 0.6 + this.rng.next() * 0.8,
            rotation: isFirstLayer ? 0 : this.rng.nextInt(0, 360),
        }

        // Blend mode based on archetype
        const blendModes = BLEND_MODES_BY_ARCHETYPE[archetype]
        const blendMode = isFirstLayer ? 'normal' : this.rng.pick(blendModes)

        // Effects based on archetype
        const effects = createDefaultEffects()

        if (archetype === 'light-melt' || archetype === 'aurora') {
            effects.blur = {
                enabled: true,
                radius: this.rng.nextInt(80, 150),
            }
        } else if (archetype === 'structural-stack') {
            effects.blur = {
                enabled: true,
                radius: this.rng.nextInt(20, 50),
            }
        } else {
            effects.blur = {
                enabled: true,
                radius: this.rng.nextInt(40, 100),
            }
        }

        return {
            id: crypto.randomUUID(),
            name,
            type,
            visible: true,
            opacity: isFirstLayer ? 1 : 0.5 + this.rng.next() * 0.5,
            colors,
            transform,
            blendMode,
            effects,
        }
    }

    // -------------------------------------------------------------------------
    // Composition Generation
    // -------------------------------------------------------------------------
    generate(options: GeneratorOptions = {}): GrydComposition {
        const {
            archetype = this.rng.pick(Object.keys(COLOR_PALETTES) as GradientArchetype[]),
            layerCount = this.rng.nextInt(2, 4),
            width = 1920,
            height = 1080,
        } = options

        // Pick a palette for this archetype
        const palettes = COLOR_PALETTES[archetype]
        const palette = this.rng.pick(palettes)

        // Generate layers
        const layers: GradientLayer[] = []
        for (let i = 0; i < layerCount; i++) {
            layers.push(this.generateLayer(
                `Layer ${i + 1}`,
                archetype,
                palette,
                i,
                layerCount
            ))
        }

        // Background color from palette (darkest)
        const bgColor = palette.find(c => this.isColorDark(c)) || '#0a0a0a'

        return {
            id: crypto.randomUUID(),
            version: 1,
            canvas: {
                width,
                height,
                backgroundColor: bgColor,
            },
            layers,
            globalEffects: {
                ...createDefaultGlobalEffects(),
                grain: {
                    enabled: archetype !== 'neon',
                    amount: 0.05 + this.rng.next() * 0.1,
                    size: 1,
                },
            },
            metadata: {
                name: `${this.capitalize(archetype)} Gradient`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        }
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------
    private isColorDark(color: string): boolean {
        // Simple hex check - if first digit is 0-3, likely dark
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            return luminance < 0.3
        }
        return false
    }

    private capitalize(str: string): string {
        return str.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }
}

// -----------------------------------------------------------------------------
// Convenience Functions
// -----------------------------------------------------------------------------
export function generateGradient(options: GeneratorOptions = {}): GrydComposition {
    const generator = new GradientGenerator(options.seed)
    return generator.generate(options)
}

export function generateWithNewSeed(archetype?: GradientArchetype): GrydComposition {
    const generator = new GradientGenerator()
    return generator.generate({ archetype })
}

export const ARCHETYPES: GradientArchetype[] = [
    'light-melt',
    'structural-stack',
    'aurora',
    'sunset',
    'ocean',
    'neon',
    'earth',
    'random',
]
