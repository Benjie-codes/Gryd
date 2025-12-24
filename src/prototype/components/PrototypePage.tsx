import React from 'react'
import GradientCanvas from './GradientCanvas'
import ControlsPanel from './ControlsPanel'
import DiscoveryOverlay from './DiscoveryOverlay'
import { useGrydStore } from '../store/compositionStore'
import './prototype.css'

const PrototypePage: React.FC = () => {
    const viewMode = useGrydStore(state => state.viewMode)

    return (
        <div className="prototype-container">
            {/* Canvas Area */}
            <div className="prototype-canvas-area">
                <GradientCanvas />

                {/* Discovery Mode Overlay */}
                {viewMode === 'discovery' && <DiscoveryOverlay />}
            </div>

            {/* Controls Panel - visible in advanced mode, collapsed in discovery */}
            <div className={`prototype-controls-panel ${viewMode === 'discovery' ? 'collapsed' : ''}`}>
                <ControlsPanel />
            </div>
        </div>
    )
}

export default PrototypePage

