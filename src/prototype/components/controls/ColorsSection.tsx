import React from 'react'
import { useGrydStore } from '../../store/compositionStore'
import { Plus, X } from 'lucide-react'

const ColorsSection: React.FC = () => {
    const activeLayerId = useGrydStore(state => state.ui.activeLayerId)
    const layers = useGrydStore(state => state.composition.layers)
    const addColorStop = useGrydStore(state => state.addColorStop)
    const removeColorStop = useGrydStore(state => state.removeColorStop)
    const updateColorStop = useGrydStore(state => state.updateColorStop)

    const activeLayer = layers.find(l => l.id === activeLayerId)

    if (!activeLayer) {
        return (
            <div className="proto-section">
                <div className="proto-section-header">
                    <span className="proto-section-title">Colors</span>
                </div>
                <div className="proto-empty-state">
                    Select a layer to edit colors
                </div>
            </div>
        )
    }

    const handleAddColor = () => {
        // Add a new color stop in the middle position
        const positions = activeLayer.colors.map(c => c.position)
        const maxPos = Math.max(...positions)
        const minPos = Math.min(...positions)
        const newPos = (maxPos + minPos) / 2

        // Generate a random-ish complementary color
        const randomHue = Math.floor(Math.random() * 360)
        const newColor = `hsl(${randomHue}, 70%, 50%)`

        addColorStop(activeLayerId!, newColor, newPos)
    }

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Colors</span>
                <button
                    className="proto-section-action"
                    onClick={handleAddColor}
                    title="Add Color Stop"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Gradient Preview Bar */}
            <div
                style={{
                    width: '100%',
                    height: 24,
                    borderRadius: 6,
                    marginBottom: 12,
                    background: `linear-gradient(90deg, ${activeLayer.colors
                            .slice()
                            .sort((a, b) => a.position - b.position)
                            .map(c => `${c.color} ${c.position * 100}%`)
                            .join(', ')
                        })`,
                    border: '1px solid var(--proto-border)',
                }}
            />

            <div className="proto-color-stops">
                {activeLayer.colors.map(colorStop => (
                    <div key={colorStop.id} className="proto-color-stop">
                        {/* Color Swatch */}
                        <div className="proto-color-stop-swatch">
                            <input
                                type="color"
                                value={colorStop.color}
                                onChange={(e) => updateColorStop(activeLayerId!, colorStop.id, { color: e.target.value })}
                                style={{ border: 'none', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Position Slider */}
                        <div className="proto-color-stop-position">
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={colorStop.position}
                                onChange={(e) => updateColorStop(activeLayerId!, colorStop.id, { position: parseFloat(e.target.value) })}
                            />
                        </div>

                        {/* Delete (only if more than 2 colors) */}
                        {activeLayer.colors.length > 2 && (
                            <button
                                className="proto-color-stop-delete"
                                onClick={() => removeColorStop(activeLayerId!, colorStop.id)}
                                title="Remove Color"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ColorsSection
