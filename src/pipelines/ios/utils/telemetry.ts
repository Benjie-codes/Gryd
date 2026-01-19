/**
 * iOS Pipeline Telemetry
 * 
 * Lightweight monitoring system to track pipeline stability and performance
 * on IOS devices.
 * 
 * Policies:
 * - 5% Sampling rate (only log for 5% of sessions/frames)
 * - No PII
 * - Console logging only (for now)
 */

type IOSEventType = 'PipelineLoaded' | 'CanvasInitialized' | 'FrameRendered' | 'Error'

interface TelemetryData {
    [key: string]: string | number | boolean | undefined
}

// 5% Sampling Rate
const SAMPLE_RATE = 0.05
const IS_SAMPLED = Math.random() < SAMPLE_RATE

export const IOSTelemetry = {
    /**
     * Log a telemetry event. Safe to call frequently; it will self-throttle.
     */
    log: (event: IOSEventType, data?: TelemetryData) => {
        // Critical errors always log, others sampled
        if (event !== 'Error' && !IS_SAMPLED) return

        const payload = {
            timestamp: Date.now(),
            platform: 'ios',
            event,
            ...data
        }

        // In a real app, this would send to Analytics Service.
        // For prototype, we log to console with a specific prefix for filtering.
        console.debug(`[Gryd-IOS-Telemetry]`, payload)
    },

    /**
     * Mark stats for timing.
     */
    now: () => performance.now()
}
