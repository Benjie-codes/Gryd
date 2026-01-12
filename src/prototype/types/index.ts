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

export type GlobalBlurEffect = {
    enabled: boolean
    strength: number // 0-100 (pixels)
}


export type GlobalNoiseEffect = {
    enabled: boolean
    intensity: number // 0-1
    scale: number // 10-200
    type: 'perlin' | 'simplex' | 'random'
}

// Halftone Gradient Overlay Effect
export type HalftonePatternType = 'stochastic_halftone' | 'ordered_halftone'

export type HalftoneSource = {
    dotSizeRange: [number, number]     // [min, max] dot size in pixels
    dotDensity: 'low' | 'medium' | 'high'
    contrast: 'low' | 'medium' | 'high'
    noiseLevel: 'low' | 'medium' | 'high'
    patternType: HalftonePatternType
    baseColor: string                   // Background color (hex)
    inkColor: string                    // Dot color (hex)
}

export type HalftoneBlendMode = 'multiply' | 'overlay' | 'soft-light' | 'hard-light'

export type HalftoneGradientEffect = {
    enabled: boolean
    gradientPosition: number            // 0.0 (source_a / subtle) to 1.0 (source_b / bold)
    sourceA: HalftoneSource             // Subtle, fine grain, low contrast
    sourceB: HalftoneSource             // Bold, coarse grain, high contrast
    blendMode: HalftoneBlendMode
    dotSizeMultiplier: number           // 0.5 - 2.0 global scale factor
    contrastIntensity: number           // 0.0 - 1.0
    noiseBlend: number                  // 0.0 - 1.0
    opacity: number                     // 0.0 - 1.0
}




// -----------------------------------------------------------------------------
// Corrugated Metal Overlay Effect
// -----------------------------------------------------------------------------
export type MetalLightingStyle = 'soft_diagonal' | 'strong_horizontal'
export type MetalBlendMode = 'overlay' | 'soft-light' | 'hard-light' | 'luminosity'

export type CorrugatedMetalEffect = {
    enabled: boolean
    distortion: number          // 0.0 (straight) to 1.0 (wavy)
    macroShading: {
        intensity: number       // 0.2 to 1.0
        style: MetalLightingStyle
    }
    microContrast: number       // 0.0 to 1.0 (metallic shine)
    density: number             // 10 to 200 (Ridge density)
    angle: number               // 0 to 360 (degrees)
    opacity: number             // 0.0 to 1.0
    blendMode: MetalBlendMode
}

// -----------------------------------------------------------------------------
// Global Texture Effect (Procedural/Preset)
// -----------------------------------------------------------------------------
export type TextureProperties = {
    type: 'diffusion' | 'granular' | 'pattern'
    surface: string
    grain: string
    gradient_type: string
    light_source: string
    alpha_channel_potential: string
}

export type TexturePreset = {
    id: string
    name: string
    description: string
    properties: TextureProperties
    keywords: string[]
    usage_notes: string
}

export type TextureEffect = {
    enabled: boolean
    presetId: string
    opacity: number
    blendMode: BlendMode
    scale: number
}


export type GlobalEffects = {
    blur: GlobalBlurEffect
    grain: GrainEffect

    noise: GlobalNoiseEffect
    halftone: HalftoneGradientEffect
    metal: CorrugatedMetalEffect
    texture: TextureEffect
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

export const createDefaultHalftoneEffect = (): HalftoneGradientEffect => ({
    enabled: false,
    gradientPosition: 0.5,
    sourceA: {
        dotSizeRange: [0.5, 2.0],
        dotDensity: 'low',
        contrast: 'low',
        noiseLevel: 'medium',
        patternType: 'stochastic_halftone',
        baseColor: '#F0F0F0',
        inkColor: '#333333',
    },
    sourceB: {
        dotSizeRange: [2.5, 6.0],
        dotDensity: 'high',
        contrast: 'high',
        noiseLevel: 'low',
        patternType: 'ordered_halftone',
        baseColor: '#FFFFFF',
        inkColor: '#000000',
    },
    blendMode: 'overlay',
    dotSizeMultiplier: 1.0,
    contrastIntensity: 0.5,
    noiseBlend: 0.3,
    opacity: 0.5,
})

export const createDefaultMetalEffect = (): CorrugatedMetalEffect => ({
    enabled: false,
    distortion: 0.5,
    macroShading: {
        intensity: 0.6,
        style: 'soft_diagonal',
    },
    microContrast: 0.8,
    density: 100,
    angle: 0,
    opacity: 0.5,
    blendMode: 'overlay',
})

export const createDefaultTextureEffect = (): TextureEffect => ({
    enabled: false,
    presetId: 'frosted_glass_smooth_001',
    opacity: 0.5,
    blendMode: 'overlay',
    scale: 1,
})



export const createDefaultGlobalBlurEffect = (): GlobalBlurEffect => ({
    enabled: false,
    strength: 30,
})

export const createDefaultGlobalEffects = (): GlobalEffects => ({
    blur: createDefaultGlobalBlurEffect(),
    grain: { enabled: false, amount: 0.1, size: 1 },

    noise: { enabled: false, intensity: 0.3, scale: 50, type: 'perlin' },
    halftone: createDefaultHalftoneEffect(),
    metal: createDefaultMetalEffect(),
    texture: createDefaultTextureEffect(),
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
