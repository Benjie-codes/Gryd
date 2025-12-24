import { create } from 'zustand'
import {
    GrydComposition,
    GradientLayer,
    GradientColorStop,
    LayerTransform,
    LayerEffects,
    GlobalEffects,
    BlendMode,
    UIState,
    createDefaultComposition,
    createDefaultLayer,
    createDefaultColorStop,
} from '../types'
import { GradientGenerator, GradientArchetype } from '../core/GradientGenerator'

// =============================================================================
// Store State Interface
// =============================================================================
export type ViewMode = 'discovery' | 'advanced'

interface GrydStore {
    // State
    composition: GrydComposition
    ui: UIState
    viewMode: ViewMode
    seed: string | null

    // Canvas Actions
    setCanvasSize: (width: number, height: number) => void
    setCanvasBackground: (color: string) => void

    // Layer Actions
    addLayer: () => void
    removeLayer: (layerId: string) => void
    reorderLayers: (fromIndex: number, toIndex: number) => void
    toggleLayerVisibility: (layerId: string) => void
    setActiveLayer: (layerId: string | null) => void
    updateLayerName: (layerId: string, name: string) => void
    updateLayerType: (layerId: string, type: GradientLayer['type']) => void
    updateLayerOpacity: (layerId: string, opacity: number) => void
    updateLayerBlendMode: (layerId: string, blendMode: BlendMode) => void

    // Color Stop Actions
    addColorStop: (layerId: string, color: string, position: number) => void
    removeColorStop: (layerId: string, colorStopId: string) => void
    updateColorStop: (layerId: string, colorStopId: string, updates: Partial<GradientColorStop>) => void

    // Transform Actions
    updateLayerTransform: (layerId: string, transform: Partial<LayerTransform>) => void
    resetLayerTransform: (layerId: string) => void

    // Effects Actions
    updateLayerEffects: (layerId: string, effects: Partial<LayerEffects>) => void
    toggleLayerEffect: (layerId: string, effectKey: keyof LayerEffects, enabled: boolean) => void

    // Global Effects Actions
    updateGlobalEffects: (effects: Partial<GlobalEffects>) => void

    // Discovery Mode Actions
    generateNewGradient: (archetype?: GradientArchetype) => void
    setViewMode: (mode: ViewMode) => void

    // Utility Actions
    resetToDefault: () => void
    getActiveLayer: () => GradientLayer | null
}

// =============================================================================
// Helper Functions
// =============================================================================
const updateLayer = (
    layers: GradientLayer[],
    layerId: string,
    updater: (layer: GradientLayer) => GradientLayer
): GradientLayer[] => {
    return layers.map(layer =>
        layer.id === layerId ? updater(layer) : layer
    )
}

// =============================================================================
// Zustand Store
// =============================================================================
// Generate initial composition
const initialGenerator = new GradientGenerator()
const initialComposition = initialGenerator.generate()

export const useGrydStore = create<GrydStore>((set, get) => ({
    // Initial State
    composition: initialComposition,
    ui: {
        activeLayerId: null,
        isPreviewing: false,
        isAnimating: false,
    },
    viewMode: 'discovery',
    seed: initialGenerator.getSeed(),

    // -------------------------------------------------------------------------
    // Canvas Actions
    // -------------------------------------------------------------------------
    setCanvasSize: (width, height) => set(state => ({
        composition: {
            ...state.composition,
            canvas: { ...state.composition.canvas, width, height },
        },
    })),

    setCanvasBackground: (color) => set(state => ({
        composition: {
            ...state.composition,
            canvas: { ...state.composition.canvas, backgroundColor: color },
        },
    })),

    // -------------------------------------------------------------------------
    // Layer Actions
    // -------------------------------------------------------------------------
    addLayer: () => set(state => {
        const layerCount = state.composition.layers.length + 1
        const newLayer = createDefaultLayer(`Layer ${layerCount}`)
        return {
            composition: {
                ...state.composition,
                layers: [...state.composition.layers, newLayer],
            },
            ui: {
                ...state.ui,
                activeLayerId: newLayer.id,
            },
        }
    }),

    removeLayer: (layerId) => set(state => {
        const newLayers = state.composition.layers.filter(l => l.id !== layerId)
        const newActiveId = state.ui.activeLayerId === layerId
            ? (newLayers.length > 0 ? newLayers[newLayers.length - 1].id : null)
            : state.ui.activeLayerId
        return {
            composition: {
                ...state.composition,
                layers: newLayers,
            },
            ui: {
                ...state.ui,
                activeLayerId: newActiveId,
            },
        }
    }),

    reorderLayers: (fromIndex, toIndex) => set(state => {
        const layers = [...state.composition.layers]
        const [removed] = layers.splice(fromIndex, 1)
        layers.splice(toIndex, 0, removed)
        return {
            composition: {
                ...state.composition,
                layers,
            },
        }
    }),

    toggleLayerVisibility: (layerId) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                visible: !layer.visible,
            })),
        },
    })),

    setActiveLayer: (layerId) => set(state => ({
        ui: {
            ...state.ui,
            activeLayerId: layerId,
        },
    })),

    updateLayerName: (layerId, name) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                name,
            })),
        },
    })),

    updateLayerType: (layerId, type) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                type,
            })),
        },
    })),

    updateLayerOpacity: (layerId, opacity) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                opacity: Math.max(0, Math.min(1, opacity)),
            })),
        },
    })),

    updateLayerBlendMode: (layerId, blendMode) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                blendMode,
            })),
        },
    })),

    // -------------------------------------------------------------------------
    // Color Stop Actions
    // -------------------------------------------------------------------------
    addColorStop: (layerId, color, position) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                colors: [...layer.colors, createDefaultColorStop(color, position)]
                    .sort((a, b) => a.position - b.position),
            })),
        },
    })),

    removeColorStop: (layerId, colorStopId) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                colors: layer.colors.filter(c => c.id !== colorStopId),
            })),
        },
    })),

    updateColorStop: (layerId, colorStopId, updates) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                colors: layer.colors.map(c =>
                    c.id === colorStopId ? { ...c, ...updates } : c
                ).sort((a, b) => a.position - b.position),
            })),
        },
    })),

    // -------------------------------------------------------------------------
    // Transform Actions
    // -------------------------------------------------------------------------
    updateLayerTransform: (layerId, transform) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                transform: { ...layer.transform, ...transform },
            })),
        },
    })),

    resetLayerTransform: (layerId) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            })),
        },
    })),

    // -------------------------------------------------------------------------
    // Effects Actions
    // -------------------------------------------------------------------------
    updateLayerEffects: (layerId, effects) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                effects: {
                    blur: effects.blur ?? layer.effects.blur,
                    noise: effects.noise ?? layer.effects.noise,
                    glow: effects.glow ?? layer.effects.glow,
                },
            })),
        },
    })),

    toggleLayerEffect: (layerId, effectKey, enabled) => set(state => ({
        composition: {
            ...state.composition,
            layers: updateLayer(state.composition.layers, layerId, layer => ({
                ...layer,
                effects: {
                    ...layer.effects,
                    [effectKey]: { ...layer.effects[effectKey], enabled },
                },
            })),
        },
    })),

    // -------------------------------------------------------------------------
    // Global Effects Actions
    // -------------------------------------------------------------------------
    updateGlobalEffects: (effects) => set(state => ({
        composition: {
            ...state.composition,
            globalEffects: {
                grain: effects.grain ?? state.composition.globalEffects.grain,
            },
        },
    })),

    // -------------------------------------------------------------------------
    // Discovery Mode Actions
    // -------------------------------------------------------------------------
    generateNewGradient: (archetype) => {
        const generator = new GradientGenerator()
        const newComposition = generator.generate({ archetype })
        set({
            composition: newComposition,
            seed: generator.getSeed(),
            ui: {
                activeLayerId: null,
                isPreviewing: false,
                isAnimating: false,
            },
        })
    },

    setViewMode: (mode) => set({ viewMode: mode }),

    // -------------------------------------------------------------------------
    // Utility Actions
    // -------------------------------------------------------------------------
    resetToDefault: () => {
        const generator = new GradientGenerator()
        const newComposition = generator.generate()
        set({
            composition: newComposition,
            seed: generator.getSeed(),
            viewMode: 'discovery',
            ui: {
                activeLayerId: null,
                isPreviewing: false,
                isAnimating: false,
            },
        })
    },

    getActiveLayer: () => {
        const state = get()
        if (!state.ui.activeLayerId) return null
        return state.composition.layers.find(l => l.id === state.ui.activeLayerId) ?? null
    },
}))
