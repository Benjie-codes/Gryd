import React, { useEffect, useCallback, useState } from 'react'
import { useGrydStore } from '../store/compositionStore'
import { ARCHETYPES, GradientArchetype } from '../core/GradientGenerator'

const DiscoveryOverlay: React.FC = () => {
    const generateNewGradient = useGrydStore(state => state.generateNewGradient)
    const setViewMode = useGrydStore(state => state.setViewMode)
    const seed = useGrydStore(state => state.seed)
    const [showArchetypes, setShowArchetypes] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // Handle regeneration with animation
    const handleRegenerate = useCallback((archetype?: GradientArchetype) => {
        setIsAnimating(true)
        setTimeout(() => {
            generateNewGradient(archetype)
            setIsAnimating(false)
        }, 150)
        setShowArchetypes(false)
    }, [generateNewGradient])

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            if (e.code === 'Space') {
                e.preventDefault()
                handleRegenerate()
            } else if (e.code === 'Enter') {
                e.preventDefault()
                setViewMode('advanced')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleRegenerate, setViewMode])

    const formatArchetypeName = (name: string) => {
        return name.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }

    return (
        <div className="discovery-overlay">
            {/* Top bar with seed info */}
            <div className="discovery-top-bar">
                <div className="discovery-seed-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span className="discovery-seed-text">
                        Seed: {seed?.slice(-8) || 'none'}
                    </span>
                </div>
            </div>

            {/* Center controls */}
            <div className="discovery-center-controls">
                {/* Archetype selector */}
                {showArchetypes && (
                    <div className="discovery-archetype-menu">
                        {ARCHETYPES.map(archetype => (
                            <button
                                key={archetype}
                                className="discovery-archetype-btn"
                                onClick={() => handleRegenerate(archetype)}
                            >
                                {formatArchetypeName(archetype)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom action bar */}
            <div className="discovery-bottom-bar">
                <div className="discovery-actions">
                    {/* Archetype toggle */}
                    <button
                        className={`discovery-action-btn discovery-action-secondary ${showArchetypes ? 'active' : ''}`}
                        onClick={() => setShowArchetypes(!showArchetypes)}
                        title="Choose style"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <span>Styles</span>
                    </button>

                    {/* Regenerate button */}
                    <button
                        className={`discovery-action-btn discovery-action-primary ${isAnimating ? 'animating' : ''}`}
                        onClick={() => handleRegenerate()}
                        title="Generate new gradient (Space)"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
                        </svg>
                        <span>Generate</span>
                    </button>

                    {/* Open Advanced Mode */}
                    <button
                        className="discovery-action-btn discovery-action-secondary"
                        onClick={() => setViewMode('advanced')}
                        title="Edit in Advanced Mode (Enter)"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
                            <polyline points="8 17 13 12 8 7" />
                            <line x1="13" y1="12" x2="1" y2="12" />
                        </svg>
                        <span>Advanced</span>
                    </button>
                </div>

                {/* Keyboard hints */}
                <div className="discovery-hints">
                    <span className="discovery-hint">
                        <kbd>Space</kbd> Regenerate
                    </span>
                    <span className="discovery-hint">
                        <kbd>Enter</kbd> Advanced Mode
                    </span>
                </div>
            </div>
        </div>
    )
}

export default DiscoveryOverlay
