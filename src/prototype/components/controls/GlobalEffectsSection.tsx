import React from 'react'
import { useGrydStore } from '../../store/compositionStore'

const GlobalEffectsSection: React.FC = () => {
    const globalEffects = useGrydStore(state => state.composition.globalEffects)
    const updateGlobalEffects = useGrydStore(state => state.updateGlobalEffects)

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Textures</span>
                <span className="proto-section-badge">Global</span>
            </div>

            {/* Grain Effect */}
            <div style={{ marginBottom: 16 }}>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Grain</span>
                    <button
                        className={`proto-toggle ${globalEffects.grain.enabled ? 'active' : ''}`}
                        onClick={() => updateGlobalEffects({
                            grain: { ...globalEffects.grain, enabled: !globalEffects.grain.enabled }
                        })}
                    />
                </div>
                {globalEffects.grain.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Amount</span>
                                <span className="proto-control-value">{(globalEffects.grain.amount * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.grain.amount}
                                onChange={(e) => updateGlobalEffects({
                                    grain: { ...globalEffects.grain, amount: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Size</span>
                                <span className="proto-control-value">{globalEffects.grain.size.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="1"
                                max="5"
                                step="0.5"
                                value={globalEffects.grain.size}
                                onChange={(e) => updateGlobalEffects({
                                    grain: { ...globalEffects.grain, size: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Noise Effect */}
            <div>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Noise</span>
                    <button
                        className={`proto-toggle ${globalEffects.noise?.enabled ? 'active' : ''}`}
                        onClick={() => updateGlobalEffects({
                            noise: {
                                ...globalEffects.noise,
                                enabled: !globalEffects.noise?.enabled,
                                intensity: globalEffects.noise?.intensity ?? 0.3,
                                scale: globalEffects.noise?.scale ?? 50,
                                type: globalEffects.noise?.type ?? 'perlin'
                            }
                        })}
                    />
                </div>
                {globalEffects.noise?.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Intensity</span>
                                <span className="proto-control-value">{(globalEffects.noise.intensity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.noise.intensity}
                                onChange={(e) => updateGlobalEffects({
                                    noise: { ...globalEffects.noise, intensity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Scale</span>
                                <span className="proto-control-value">{globalEffects.noise.scale}px</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="10"
                                max="200"
                                step="5"
                                value={globalEffects.noise.scale}
                                onChange={(e) => updateGlobalEffects({
                                    noise: { ...globalEffects.noise, scale: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Type</span>
                            </div>
                            <div className="proto-button-group">
                                {(['perlin', 'simplex', 'random'] as const).map((type) => (
                                    <button
                                        key={type}
                                        className={`proto-button-group-item ${globalEffects.noise.type === type ? 'active' : ''}`}
                                        onClick={() => updateGlobalEffects({
                                            noise: { ...globalEffects.noise, type }
                                        })}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GlobalEffectsSection
