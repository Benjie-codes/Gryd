import React from 'react'
import { useGrydStore } from '../../store/compositionStore'
import { BlendMode } from '../../types'

const BLEND_MODES: { value: BlendMode; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
]

const AdvancedSection: React.FC = () => {
    const activeLayerId = useGrydStore(state => state.ui.activeLayerId)
    const layers = useGrydStore(state => state.composition.layers)
    const updateLayerOpacity = useGrydStore(state => state.updateLayerOpacity)
    const updateLayerBlendMode = useGrydStore(state => state.updateLayerBlendMode)
    const updateLayerType = useGrydStore(state => state.updateLayerType)

    const activeLayer = layers.find(l => l.id === activeLayerId)

    if (!activeLayer) {
        return (
            <div className="proto-section">
                <div className="proto-section-header">
                    <span className="proto-section-title">Advanced</span>
                </div>
                <div className="proto-empty-state">
                    Select a layer for advanced options
                </div>
            </div>
        )
    }

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Advanced</span>
            </div>

            {/* Gradient Type */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Gradient Type</span>
                </div>
                <select
                    className="proto-select"
                    value={activeLayer.type}
                    onChange={(e) => updateLayerType(activeLayerId!, e.target.value as 'linear' | 'radial' | 'mesh')}
                >
                    <option value="radial">Radial</option>
                    <option value="linear">Linear</option>
                    <option value="mesh">Mesh (experimental)</option>
                </select>
            </div>

            {/* Blend Mode */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Blend Mode</span>
                </div>
                <select
                    className="proto-select"
                    value={activeLayer.blendMode}
                    onChange={(e) => updateLayerBlendMode(activeLayerId!, e.target.value as BlendMode)}
                >
                    {BLEND_MODES.map(mode => (
                        <option key={mode.value} value={mode.value}>
                            {mode.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Opacity */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Opacity</span>
                    <span className="proto-control-value">{(activeLayer.opacity * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    className="proto-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    value={activeLayer.opacity}
                    onChange={(e) => updateLayerOpacity(activeLayerId!, parseFloat(e.target.value))}
                />
            </div>
        </div>
    )
}

export default AdvancedSection
