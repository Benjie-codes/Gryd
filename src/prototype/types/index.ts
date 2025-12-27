// =============================================================================
// GRYD Prototype Type Definitions
// Canonical data schema matching the PRD specification
// =============================================================================

// -----------------------------------------------------------------------------
// Canvas Settings
// -----------------------------------------------------------------------------
export type CanvasSettings = {
    width: number
    height: number
    backgroundColor: string
}

// -----------------------------------------------------------------------------
// Blend Modes
// -----------------------------------------------------------------------------
export type BlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'soft-light'
    | 'hard-light'
    | 'color-dodge'
    | 'color-burn'

// -----------------------------------------------------------------------------
// Color Stops
// -----------------------------------------------------------------------------
export type GradientColorStop = {
    id: string
    color: string
    position: number // 0–1
}

// -----------------------------------------------------------------------------
// Transform Controls
// -----------------------------------------------------------------------------
export type LayerTransform = {
    x: number      // -1 → 1 (offset from center)
    y: number      // -1 → 1 (offset from center)
    scale: number  // 0 → 2
    rotation: number // degrees (0-360)
}

// -----------------------------------------------------------------------------
// Layer Effects
// -----------------------------------------------------------------------------
export type BlurEffect = {
    enabled: boolean
    radius: number // pixels
}

export type NoiseEffect = {
    enabled: boolean
    intensity: number // 0-1
    scale: number // 1-100
}

export type GlowEffect = {
    enabled: boolean
    intensity: number // 0-1
    spread: number // pixels
}

export type LayerEffects = {
    blur: BlurEffect
    noise: NoiseEffect
    glow: GlowEffect
}

// -----------------------------------------------------------------------------
// Global Effects
// -----------------------------------------------------------------------------
export type GrainEffect = {
    enabled: boolean
    amount: number // 0-1
    size: number // 1-5
}

export type GlobalNoiseEffect = {
    enabled: boolean
    intensity: number // 0-1
    scale: number // 10-200
    type: 'perlin' | 'simplex' | 'random'
}

export type GlobalEffects = {
    grain: GrainEffect
    noise: GlobalNoiseEffect
}

// -----------------------------------------------------------------------------
// Gradient Layer
// -----------------------------------------------------------------------------
export type GradientType = 'linear' | 'radial' | 'mesh'

export type GradientLayer = {
    id: string
    name: string
    type: GradientType
    visible: boolean
    opacity: number // 0-1
    colors: GradientColorStop[]
    transform: LayerTransform
    blendMode: BlendMode
    effects: LayerEffects
}

// -----------------------------------------------------------------------------
// Composition Metadata
// -----------------------------------------------------------------------------
export type CompositionMetadata = {
    name: string
    createdAt: string
    updatedAt: string
}

// -----------------------------------------------------------------------------
// Top-Level Composition
// -----------------------------------------------------------------------------
export type GrydComposition = {
    id: string
    version: number
    canvas: CanvasSettings
    layers: GradientLayer[]
    globalEffects: GlobalEffects
    metadata: CompositionMetadata
}

// -----------------------------------------------------------------------------
// UI State (separate from composition data)
// -----------------------------------------------------------------------------
export type UIState = {
    activeLayerId: string | null
    isPreviewing: boolean
    isAnimating: boolean
}

// -----------------------------------------------------------------------------
// Store State (combines composition + UI state)
// -----------------------------------------------------------------------------
export type GrydStoreState = {
    composition: GrydComposition
    ui: UIState
}

// -----------------------------------------------------------------------------
// Factory Functions for Default Values
// -----------------------------------------------------------------------------
export const createDefaultTransform = (): LayerTransform => ({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
})

export const createDefaultEffects = (): LayerEffects => ({
    blur: { enabled: false, radius: 0 },
    noise: { enabled: false, intensity: 0.5, scale: 50 },
    glow: { enabled: false, intensity: 0.5, spread: 20 },
})

export const createDefaultGlobalEffects = (): GlobalEffects => ({
    grain: { enabled: false, amount: 0.1, size: 1 },
    noise: { enabled: false, intensity: 0.3, scale: 50, type: 'perlin' },
})

export const createDefaultColorStop = (color: string, position: number): GradientColorStop => ({
    id: crypto.randomUUID(),
    color,
    position,
})

export const createDefaultLayer = (name: string, type: GradientType = 'radial'): GradientLayer => ({
    id: crypto.randomUUID(),
    name,
    type,
    visible: true,
    opacity: 1,
    colors: [
        createDefaultColorStop('#22c55e', 0),   // Green accent
        createDefaultColorStop('#0a0a0a', 1),   // Dark background
    ],
    transform: createDefaultTransform(),
    blendMode: 'normal',
    effects: createDefaultEffects(),
})

export const createDefaultComposition = (): GrydComposition => ({
    id: crypto.randomUUID(),
    version: 1,
    canvas: {
        width: 1920,
        height: 1080,
        backgroundColor: '#0a0a0a',
    },
    layers: [
        createDefaultLayer('Layer 1', 'radial'),
    ],
    globalEffects: createDefaultGlobalEffects(),
    metadata: {
        name: 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
})
