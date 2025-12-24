import React from 'react'
import { useGrydStore } from '../../store/compositionStore'
import { RotateCcw } from 'lucide-react'

const TransformSection: React.FC = () => {
    const activeLayerId = useGrydStore(state => state.ui.activeLayerId)
    const layers = useGrydStore(state => state.composition.layers)
    const updateLayerTransform = useGrydStore(state => state.updateLayerTransform)
    const resetLayerTransform = useGrydStore(state => state.resetLayerTransform)

    const activeLayer = layers.find(l => l.id === activeLayerId)

    if (!activeLayer) {
        return (
            <div className="proto-section">
                <div className="proto-section-header">
                    <span className="proto-section-title">Transform</span>
                </div>
                <div className="proto-empty-state">
                    Select a layer to transform
                </div>
            </div>
        )
    }

    const transform = activeLayer.transform

    const handleReset = () => {
        if (activeLayerId) {
            resetLayerTransform(activeLayerId)
        }
    }

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Transform</span>
                <button
                    className="proto-section-action"
                    onClick={handleReset}
                    title="Reset Transform"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* X Offset */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>X Offset</span>
                    <span className="proto-control-value">{(transform.x * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    className="proto-slider"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={transform.x}
                    onChange={(e) => updateLayerTransform(activeLayerId!, { x: parseFloat(e.target.value) })}
                />
            </div>

            {/* Y Offset */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Y Offset</span>
                    <span className="proto-control-value">{(transform.y * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    className="proto-slider"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={transform.y}
                    onChange={(e) => updateLayerTransform(activeLayerId!, { y: parseFloat(e.target.value) })}
                />
            </div>

            {/* Scale */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Scale</span>
                    <span className="proto-control-value">{(transform.scale * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    className="proto-slider"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={transform.scale}
                    onChange={(e) => updateLayerTransform(activeLayerId!, { scale: parseFloat(e.target.value) })}
                />
            </div>

            {/* Rotation */}
            <div className="proto-control-group">
                <div className="proto-control-label">
                    <span>Rotation</span>
                    <span className="proto-control-value">{transform.rotation.toFixed(0)}°</span>
                </div>
                <input
                    type="range"
                    className="proto-slider"
                    min="0"
                    max="360"
                    step="1"
                    value={transform.rotation}
                    onChange={(e) => updateLayerTransform(activeLayerId!, { rotation: parseFloat(e.target.value) })}
                />
            </div>
        </div>
    )
}

export default TransformSection
