import React, { useRef, useEffect, useCallback } from 'react'
import { useGrydStore } from '../store/compositionStore'
import { CanvasRenderer } from '../core/CanvasRenderer'

interface GradientCanvasProps {
    className?: string
}

const GradientCanvas: React.FC<GradientCanvasProps> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rendererRef = useRef<CanvasRenderer | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Subscribe to composition changes
    const composition = useGrydStore(state => state.composition)

    // Initialize renderer
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Initialize canvas size
        const container = containerRef.current
        if (container) {
            canvas.width = container.clientWidth
            canvas.height = container.clientHeight
        }

        // Create renderer
        rendererRef.current = new CanvasRenderer(canvas)

        // Initial render
        rendererRef.current.render(composition)

        return () => {
            rendererRef.current?.destroy()
            rendererRef.current = null
        }
    }, [])

    // Re-render on composition changes
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.render(composition)
        }
    }, [composition])

    // Handle resize
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const width = container.clientWidth
        const height = container.clientHeight

        if (rendererRef.current) {
            rendererRef.current.resize(width, height)
            rendererRef.current.render(composition)
        }
    }, [composition])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleResize)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [handleResize])

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden ${className || ''}`}
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ imageRendering: 'auto' }}
            />
        </div>
    )
}

export default GradientCanvas
