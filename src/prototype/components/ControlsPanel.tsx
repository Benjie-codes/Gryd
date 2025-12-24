import React, { useState } from 'react'
import LayersSection from './controls/LayersSection'
import ColorsSection from './controls/ColorsSection'
import TransformSection from './controls/TransformSection'
import EffectsSection from './controls/EffectsSection'
import AdvancedSection from './controls/AdvancedSection'
import ExportModal from './ExportModal'
import { useGrydStore } from '../store/compositionStore'

const ControlsPanel: React.FC = () => {
    const [showExportModal, setShowExportModal] = useState(false)
    const setViewMode = useGrydStore(state => state.setViewMode)
    const generateNewGradient = useGrydStore(state => state.generateNewGradient)

    return (
        <div className="proto-controls-wrapper">
            {/* Header */}
            <div className="proto-section proto-header-section">
                <div className="proto-header-row">
                    <div className="proto-header-title">
                        <span className="proto-logo">GRYD</span>
                        <span className="proto-badge">Advanced</span>
                    </div>
                    <button
                        className="proto-header-btn proto-header-btn-icon"
                        onClick={() => setViewMode('discovery')}
                        title="Back to Discovery Mode"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                </div>
                <p className="proto-header-subtitle">
                    Style-first gradient composition
                </p>

                {/* Action buttons */}
                <div className="proto-header-actions">
                    <button
                        className="proto-action-btn"
                        onClick={() => generateNewGradient()}
                        title="Generate new gradient"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
                        </svg>
                        Regenerate
                    </button>
                    <button
                        className="proto-action-btn proto-action-btn-primary"
                        onClick={() => setShowExportModal(true)}
                        title="Export gradient"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Control Sections */}
            <LayersSection />
            <ColorsSection />
            <TransformSection />
            <EffectsSection />
            <AdvancedSection />

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />
        </div>
    )
}

export default ControlsPanel
