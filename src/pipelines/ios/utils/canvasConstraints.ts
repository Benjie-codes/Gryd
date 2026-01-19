/**
 * iOS Canvas Constraint Layer
 * 
 * Provides factory functions and constraint logic to ensure safe canvas usage
 * on iOS devices, which have stricter memory limits and different performance
 * characteristics than desktop GPUs.
 */

// Constraint Constants
const MAX_IOS_DPR = 2.0
const MAX_IOS_DIMENSION = 2048

export interface ConstrainedDimensions {
    width: number       // Physical pixel width (clamped)
    height: number      // Physical pixel height (clamped)
    dpr: number         // The enforced DPR used for calculation
    cssWidth: number    // Original CSS width
    cssHeight: number   // Original CSS height
}

/**
 * Calculates safe canvas dimensions based on requested size and device capabilities.
 * 
 * Constraints applied:
 * 1. Device Pixel Ratio (DPR) is clamped to a maximum of 2.0.
 * 2. Final physical dimensions are clamped to 2048px (aspect ratio preserved where possible, 
 *    but hard cap wins if exceeding).
 * 
 * @param cssWidth - The logical (CSS) width of the container
 * @param cssHeight - The logical (CSS) height of the container
 * @param systemDpr - The system's actual device pixel ratio (default: window.devicePixelRatio)
 */
export function getConstrainedDimensions(
    cssWidth: number,
    cssHeight: number,
    systemDpr: number = (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
): ConstrainedDimensions {
    // 1. Clamp DPR
    // High-density iOS screens can go up to 3x, which is expensive for full-screen canvas
    const dpr = Math.min(systemDpr, MAX_IOS_DPR)

    // Calculate target physical pixels
    let width = Math.floor(cssWidth * dpr)
    let height = Math.floor(cssHeight * dpr)

    // 2. Cap Buffer Dimensions
    // If width exceeds max, scale down maintaining aspect ratio (optional, or just hard clamp?)
    // Requirement says "Cap canvas width/height", usually means strict maximum.
    // For rendering, preserving aspect ratio is crucial to avoid stretching.

    if (width > MAX_IOS_DIMENSION || height > MAX_IOS_DIMENSION) {
        // Calculate aspect ratio
        const ratio = width / height

        if (width > height) {
            // Width restricted
            if (width > MAX_IOS_DIMENSION) {
                width = MAX_IOS_DIMENSION
                height = Math.floor(MAX_IOS_DIMENSION / ratio)
            }
        } else {
            // Height restricted
            if (height > MAX_IOS_DIMENSION) {
                height = MAX_IOS_DIMENSION
                width = Math.floor(MAX_IOS_DIMENSION * ratio)
            }
        }
    }

    return {
        width,
        height,
        dpr,
        cssWidth,
        cssHeight
    }
}

/**
 * Canvas Factory: Creates a safe buffer canvas.
 * 
 * Requirement: Prevent OffscreenCanvas usage.
 * iOS WebKit has historically had issues/instability with OffscreenCanvas 
 * (memory leaks, context loss). We force standard HTMLCanvasElement.
 * 
 * @param width - Physical width
 * @param height - Physical height
 */
export function createIOSBufferCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // Explicitly do not use OffscreenCanvas.
    // Ensure the context is created with safe settings immediately if needed, 
    // though usually context creation happens by consumer.
    return canvas
}
