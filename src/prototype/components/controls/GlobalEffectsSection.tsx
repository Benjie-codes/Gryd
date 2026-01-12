import React from 'react'
import { useGrydStore } from '../../store/compositionStore'
import { HalftoneBlendMode, createDefaultHalftoneEffect, createDefaultMetalEffect, createDefaultTextureEffect, createDefaultGlobalBlurEffect } from '../../types'

import textureData from '../../data/globalTextures.json'


const GlobalEffectsSection: React.FC = () => {
    const globalEffects = useGrydStore(state => state.composition.globalEffects)
    const updateGlobalEffects = useGrydStore(state => state.updateGlobalEffects)

    const halftoneBlendModes: HalftoneBlendMode[] = ['multiply', 'overlay', 'soft-light', 'hard-light']

    return (
        <div className="proto-section">
            <div className="proto-section-header">
                <span className="proto-section-title">Textures</span>
                <span className="proto-section-badge">Global</span>
            </div>

            {/* Blur Effect */}
            <div style={{ marginBottom: 16 }}>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Blur</span>
                    <button
                        className={`proto-toggle ${globalEffects.blur?.enabled ? 'active' : ''}`}
                        onClick={() => {
                            const currentBlur = globalEffects.blur || createDefaultGlobalBlurEffect()
                            // Ensure visible strength when enabling if currently 0
                            const targetStrength = (currentBlur.strength === 0) ? 30 : currentBlur.strength

                            updateGlobalEffects({
                                blur: {
                                    ...currentBlur,
                                    enabled: !currentBlur.enabled,
                                    strength: targetStrength
                                }
                            })
                        }}
                    />
                </div>
                {globalEffects.blur?.enabled && (
                    <div className="proto-effect-controls">
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Strength</span>
                                <span className="proto-control-value">{globalEffects.blur.strength}px</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="200"
                                step="1"
                                value={globalEffects.blur.strength}
                                onChange={(e) => updateGlobalEffects({
                                    blur: { ...globalEffects.blur, strength: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
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
            <div style={{ marginBottom: 16 }}>
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

            {/* Halftone Gradient Effect */}
            <div style={{ marginBottom: 16 }}>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Halftone</span>
                    <button
                        className={`proto-toggle ${globalEffects.halftone?.enabled ? 'active' : ''}`}
                        onClick={() => {
                            const currentHalftone = globalEffects.halftone || createDefaultHalftoneEffect()
                            updateGlobalEffects({
                                halftone: {
                                    ...currentHalftone,
                                    enabled: !currentHalftone.enabled
                                }
                            })
                        }}
                    />
                </div>
                {globalEffects.halftone?.enabled && (
                    <div className="proto-effect-controls">
                        {/* Gradient Position */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Gradient Position</span>
                                <span className="proto-control-value">{(globalEffects.halftone.gradientPosition * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.halftone.gradientPosition}
                                onChange={(e) => updateGlobalEffects({
                                    halftone: { ...globalEffects.halftone, gradientPosition: parseFloat(e.target.value) }
                                })}
                            />
                            <div className="proto-control-hint">
                                <span>Subtle</span>
                                <span>Bold</span>
                            </div>
                        </div>

                        {/* Blend Mode */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Blend Mode</span>
                            </div>
                            <div className="proto-button-group">
                                {halftoneBlendModes.map((mode) => (
                                    <button
                                        key={mode}
                                        className={`proto-button-group-item ${globalEffects.halftone.blendMode === mode ? 'active' : ''}`}
                                        onClick={() => updateGlobalEffects({
                                            halftone: { ...globalEffects.halftone, blendMode: mode }
                                        })}
                                    >
                                        {mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dot Size Multiplier */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Dot Size</span>
                                <span className="proto-control-value">{globalEffects.halftone.dotSizeMultiplier.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={globalEffects.halftone.dotSizeMultiplier}
                                onChange={(e) => updateGlobalEffects({
                                    halftone: { ...globalEffects.halftone, dotSizeMultiplier: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Contrast Intensity */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Contrast</span>
                                <span className="proto-control-value">{(globalEffects.halftone.contrastIntensity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.halftone.contrastIntensity}
                                onChange={(e) => updateGlobalEffects({
                                    halftone: { ...globalEffects.halftone, contrastIntensity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Noise Blend */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Noise Blend</span>
                                <span className="proto-control-value">{(globalEffects.halftone.noiseBlend * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.halftone.noiseBlend}
                                onChange={(e) => updateGlobalEffects({
                                    halftone: { ...globalEffects.halftone, noiseBlend: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Opacity */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Opacity</span>
                                <span className="proto-control-value">{(globalEffects.halftone.opacity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.halftone.opacity}
                                onChange={(e) => updateGlobalEffects({
                                    halftone: { ...globalEffects.halftone, opacity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Corrugated Metal Effect */}
            <div>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Corrugated Metal</span>
                    <button
                        className={`proto-toggle ${globalEffects.metal?.enabled ? 'active' : ''}`}
                        onClick={() => {
                            const currentMetal = globalEffects.metal || createDefaultMetalEffect()
                            updateGlobalEffects({
                                metal: {
                                    ...currentMetal,
                                    enabled: !currentMetal.enabled
                                }
                            })
                        }}
                    />
                </div>
                {globalEffects.metal?.enabled && (
                    <div className="proto-effect-controls">
                        {/* Distortion (Wave Amplitude) */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Distortion</span>
                                <span className="proto-control-value">{(globalEffects.metal.distortion * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.metal.distortion}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, distortion: parseFloat(e.target.value) }
                                })}
                            />
                            <div className="proto-control-hint">
                                <span>Straight</span>
                                <span>Wavy</span>
                            </div>
                        </div>

                        {/* Macro Shading (Vignette) */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Radiance</span>
                                <span className="proto-control-value">{(globalEffects.metal.macroShading.intensity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0.2"
                                max="1"
                                step="0.01"
                                value={globalEffects.metal.macroShading.intensity}
                                onChange={(e) => updateGlobalEffects({
                                    metal: {
                                        ...globalEffects.metal,
                                        macroShading: {
                                            ...globalEffects.metal.macroShading,
                                            intensity: parseFloat(e.target.value)
                                        }
                                    }
                                })}
                            />
                        </div>

                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Lighting Style</span>
                            </div>
                            <div className="proto-button-group">
                                <button
                                    className={`proto-button-group-item ${globalEffects.metal.macroShading.style === 'soft_diagonal' ? 'active' : ''}`}
                                    onClick={() => updateGlobalEffects({
                                        metal: {
                                            ...globalEffects.metal,
                                            macroShading: {
                                                ...globalEffects.metal.macroShading,
                                                style: 'soft_diagonal'
                                            }
                                        }
                                    })}
                                >
                                    Soft Diagonal
                                </button>
                                <button
                                    className={`proto-button-group-item ${globalEffects.metal.macroShading.style === 'strong_horizontal' ? 'active' : ''}`}
                                    onClick={() => updateGlobalEffects({
                                        metal: {
                                            ...globalEffects.metal,
                                            macroShading: {
                                                ...globalEffects.metal.macroShading,
                                                style: 'strong_horizontal'
                                            }
                                        }
                                    })}
                                >
                                    Strong Horizontal
                                </button>
                            </div>
                        </div>

                        {/* Micro Contrast (Shine) */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Shine</span>
                                <span className="proto-control-value">{(globalEffects.metal.microContrast * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.metal.microContrast}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, microContrast: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Density */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Density</span>
                                <span className="proto-control-value">{globalEffects.metal.density}</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="10"
                                max="200"
                                step="10"
                                value={globalEffects.metal.density}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, density: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Angle */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Angle</span>
                                <span className="proto-control-value">{globalEffects.metal.angle ?? 0}°</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="180"
                                step="1"
                                value={globalEffects.metal.angle ?? 0}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, angle: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Blend Mode */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Blend Mode</span>
                            </div>
                            <select
                                className="proto-select"
                                value={globalEffects.metal.blendMode}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, blendMode: e.target.value as any }
                                })}
                            >
                                <option value="overlay">Overlay</option>
                                <option value="soft-light">Soft Light</option>
                                <option value="hard-light">Hard Light</option>
                                <option value="luminosity">Luminosity</option>
                            </select>
                        </div>

                        {/* Opacity */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Opacity</span>
                                <span className="proto-control-value">{(globalEffects.metal.opacity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.metal.opacity}
                                onChange={(e) => updateGlobalEffects({
                                    metal: { ...globalEffects.metal, opacity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Texture Effect */}
            <div>
                <div className="proto-effect-row">
                    <span className="proto-effect-label">Texture Overlay</span>
                    <button
                        className={`proto-toggle ${globalEffects.texture?.enabled ? 'active' : ''}`}
                        onClick={() => {
                            const currentTexture = globalEffects.texture || createDefaultTextureEffect()
                            updateGlobalEffects({
                                texture: {
                                    ...currentTexture,
                                    enabled: !currentTexture.enabled
                                }
                            })
                        }}
                    />
                </div>
                {globalEffects.texture?.enabled && (
                    <div className="proto-effect-controls">
                        {/* Preset Selection */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Style</span>
                            </div>
                            <select
                                className="proto-select"
                                value={globalEffects.texture.presetId}
                                onChange={(e) => updateGlobalEffects({
                                    texture: { ...globalEffects.texture, presetId: e.target.value }
                                })}
                            >
                                {textureData.global_effect_texture.textures.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <div className="proto-control-description" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                {textureData.global_effect_texture.textures.find(t => t.id === globalEffects.texture.presetId)?.description}
                            </div>
                        </div>

                        {/* Scale */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Scale</span>
                                <span className="proto-control-value">{globalEffects.texture.scale.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={globalEffects.texture.scale}
                                onChange={(e) => updateGlobalEffects({
                                    texture: { ...globalEffects.texture, scale: parseFloat(e.target.value) }
                                })}
                            />
                        </div>

                        {/* Blend Mode */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Blend Mode</span>
                            </div>
                            <select
                                className="proto-select"
                                value={globalEffects.texture.blendMode}
                                onChange={(e) => updateGlobalEffects({
                                    texture: { ...globalEffects.texture, blendMode: e.target.value as any }
                                })}
                            >
                                <option value="overlay">Overlay</option>
                                <option value="soft-light">Soft Light</option>
                                <option value="hard-light">Hard Light</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="color-dodge">Color Dodge</option>
                                <option value="color-burn">Color Burn</option>
                            </select>
                        </div>

                        {/* Opacity */}
                        <div className="proto-control-group">
                            <div className="proto-control-label">
                                <span>Opacity</span>
                                <span className="proto-control-value">{(globalEffects.texture.opacity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                className="proto-slider"
                                min="0"
                                max="1"
                                step="0.01"
                                value={globalEffects.texture.opacity}
                                onChange={(e) => updateGlobalEffects({
                                    texture: { ...globalEffects.texture, opacity: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>

        </div >

    )
}

export default GlobalEffectsSection
