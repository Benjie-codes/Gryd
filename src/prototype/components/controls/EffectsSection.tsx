import React from 'react'
import { useGrydStore } from '../../store/compositionStore'

const EffectsSection: React.FC = () => {
    const activeLayerId = useGrydStore(state => state.ui.activeLayerId)
    const layers = useGrydStore(state => state.composition.layers)
    const toggleLayerEffect = useGrydStore(state => state.toggleLayerEffect)
    const updateLayerEffects = useGrydStore(state => state.updateLayerEffects)

    const activeLayer = layers.find(l => l.id === activeLayerId)

    if (!activeLayer) {
        return (
            <div className="proto-section">
                <div className="proto-section-header">
                    <span className="proto-section-title">Effects</span>
                </div>
                <div className="proto-empty-state">
                    Select a layer to add effects
                </div>
            </div>
        )
    }

    const effects = activeLayer.effects

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Effects</span>
            </div>

            {/* Blur Effect */}
            <div style={{ marginBottom: 16 }}>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Blur</span>
                    <button
                        className={`proto-toggle ${effects.blur.enabled ? 'active' : ''}`}
                        onClick={() => toggleLayerEffect(activeLayerId!, 'blur', !effects.blur.enabled)}
                    />
                </div>
                {effects.blur.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Radius</span>
                                <span className="proto-control-value">{effects.blur.radius}px</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="50"
                                step="1"
                                value={effects.blur.radius}
                                onChange={(e) => updateLayerEffects(activeLayerId!, {
                                    blur: { ...effects.blur, radius: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Noise Effect */}
            <div style={{ marginBottom: 16 }}>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Noise</span>
                    <button
                        className={`proto-toggle ${effects.noise.enabled ? 'active' : ''}`}
                        onClick={() => toggleLayerEffect(activeLayerId!, 'noise', !effects.noise.enabled)}
                    />
                </div>
                {effects.noise.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Intensity</span>
                                <span className="proto-control-value">{(effects.noise.intensity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={effects.noise.intensity}
                                onChange={(e) => updateLayerEffects(activeLayerId!, {
                                    noise: { ...effects.noise, intensity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Glow Effect */}
            <div>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Glow</span>
                    <button
                        className={`proto-toggle ${effects.glow.enabled ? 'active' : ''}`}
                        onClick={() => toggleLayerEffect(activeLayerId!, 'glow', !effects.glow.enabled)}
                    />
                </div>
                {effects.glow.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Intensity</span>
                                <span className="proto-control-value">{(effects.glow.intensity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={effects.glow.intensity}
                                onChange={(e) => updateLayerEffects(activeLayerId!, {
                                    glow: { ...effects.glow, intensity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Spread</span>
                                <span className="proto-control-value">{effects.glow.spread}px</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="100"
                                step="1"
                                value={effects.glow.spread}
                                onChange={(e) => updateLayerEffects(activeLayerId!, {
                                    glow: { ...effects.glow, spread: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EffectsSection
