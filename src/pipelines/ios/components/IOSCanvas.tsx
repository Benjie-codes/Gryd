import React, { useRef, useEffect, useCallback } from 'react'
import { useGrydStore } from '../../../prototype/store/compositionStore'
import { IOSRenderer } from '../core/IOSRenderer'
import { IOSTelemetry } from '../utils/telemetry'

// Configuration interface passed from Bootstrap
export interface IOSPipelineConfig {
    disableFilters?: boolean
    forceLowResolution?: boolean
}

export interface IOSCanvasProps {
    className?: string
    config?: IOSPipelineConfig
}

/**
 * IOSCanvas - Main Entry Point for the iOS Rendering Pipeline
 * 
 * Responsibilities:
 * 1. Initialize the <canvas> element isolated from production DOM interactions.
 * 2. Instantiate the IOSRenderer engine.
 * 3. Subscribe to state changes and trigger renders.
 * 4. Handle resizing and cleanup.
 */
const IOSCanvas: React.FC<IOSCanvasProps> = ({ className, config }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rendererRef = useRef<IOSRenderer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Select specific composition state to minimize re-renders if needed, 
    // though here we take the whole composition object as the renderer needs it all.
    const composition = useGrydStore(state => state.composition)

    // Initialization Lifecycle
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // 1. Initial Sizing
        const container = containerRef.current
        if (container) {
            canvas.width = container.clientWidth
            canvas.height = container.clientHeight
        }

        // 2. Renderer Instantiation
        try {
            // Note: We could pass config to the renderer constructor if it supported it.
            // For now, defaults are baked into IOSRenderer, but we structure this for future config passing.
            rendererRef.current = new IOSRenderer(canvas)

            // 3. Initial Draw
            rendererRef.current.render(composition)

            IOSTelemetry.log('CanvasInitialized', { width: canvas.width, height: canvas.height })
        } catch (e) {
            console.error('[IOS-PIPELINE] Initialization Failed:', e)
            IOSTelemetry.log('Error', { type: 'InitFailed', message: String(e) })
        }

        // Cleanup
        return () => {
            rendererRef.current?.destroy()
            rendererRef.current = null
        }
    }, []) // Run once on mount

    // Render Loop Subscription
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.render(composition)
        }
    }, [composition])

    // Resize Handling
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const width = container.clientWidth
        const height = container.clientHeight

        if (rendererRef.current) {
            rendererRef.current.resize(width, height)
            // Trigger immediate re-render after resize
            rendererRef.current.render(composition)
        }
    }, [composition])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleResize)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }
        return () => resizeObserver.disconnect()
    }, [handleResize])

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden ${className || ''}`}
            data-pipeline="ios" // DOM marker for debugging
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                // WebKit-specific styles to prevent touch actions and ghost clicks
                style={{
                    imageRendering: 'auto',
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                }}
            />
        </div>
    )
}

// Default export for Lazy Loading
export default IOSCanvas
