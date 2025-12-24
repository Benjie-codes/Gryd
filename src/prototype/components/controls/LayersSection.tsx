import React from 'react'
import { useGrydStore } from '../../store/compositionStore'
import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react'

const LayersSection: React.FC = () => {
    const layers = useGrydStore(state => state.composition.layers)
    const activeLayerId = useGrydStore(state => state.ui.activeLayerId)
    const addLayer = useGrydStore(state => state.addLayer)
    const removeLayer = useGrydStore(state => state.removeLayer)
    const toggleLayerVisibility = useGrydStore(state => state.toggleLayerVisibility)
    const setActiveLayer = useGrydStore(state => state.setActiveLayer)

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Layers</span>
                <button
                    className="proto-section-action"
                    onClick={addLayer}
                    title="Add Layer"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="proto-layer-list">
                {layers.length === 0 ? (
                    <div className="proto-empty-state">
                        No layers yet. Click + to add one.
                    </div>
                ) : (
                    // Render in reverse for visual stacking order (top layer first)
                    [...layers].reverse().map(layer => (
                        <div
                            key={layer.id}
                            className={`proto-layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
                            onClick={() => setActiveLayer(layer.id)}
                        >
                            {/* Layer color preview */}
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 4,
                                    background: layer.colors.length > 0
                                        ? `linear-gradient(135deg, ${layer.colors.map(c => c.color).join(', ')})`
                                        : '#333',
                                    border: '1px solid var(--proto-border)',
                                }}
                            />

                            <span className="proto-layer-name">{layer.name}</span>

                            {/* Visibility toggle */}
                            <button
                                className={`proto-layer-visibility ${!layer.visible ? 'hidden' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleLayerVisibility(layer.id)
                                }}
                                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                            >
                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            {/* Delete button */}
                            <button
                                className="proto-layer-delete"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeLayer(layer.id)
                                }}
                                title="Delete Layer"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default LayersSection
