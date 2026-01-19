import React, { Suspense, lazy, Component, ErrorInfo } from 'react'
import { isIOS } from '../lib/platform'
import { StaticFallbackCanvas } from './StaticFallbackCanvas'
import { IOSTelemetry } from '../pipelines/ios/utils/telemetry'

// Lazy load pipelines using dynamic imports
// This ensures that pipeline-specific code is split into separate chunks
const ProductionCanvas = lazy(() => import('../prototype/components/GradientCanvas'))
const IOSCanvas = lazy(() => import('../pipelines/ios/components/IOSCanvas'))

interface CanvasBootstrapProps {
    className?: string
}

interface ErrorBoundaryState {
    hasError: boolean
}

// Simple Error Boundary to catch render failures in the pipeline
class PipelineErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Pipeline Rendering Error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <StaticFallbackCanvas className="w-full h-full" />
            )
        }
        return this.props.children
    }
}

/**
 * Bootstrap Loader for the Rendering Pipeline
 * Dynamically selects and loads the appropriate rendering engine based on platform.
 */
export const CanvasBootstrap: React.FC<CanvasBootstrapProps> = (props) => {
    // Deterministic selection based on platform module
    // This logic runs once during component render
    const PipelineComponent = isIOS ? IOSCanvas : ProductionCanvas

    if (isIOS) {
        IOSTelemetry.log('PipelineLoaded', { bootstrap: true })
    }

    return (
        <PipelineErrorBoundary>
            <Suspense
                fallback={
                    <div className="w-full h-full bg-transparent" />
                }
            >
                <PipelineComponent {...props} />
            </Suspense>
        </PipelineErrorBoundary>
    )
}

export default CanvasBootstrap
