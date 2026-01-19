/**
 * iOS Quality Tier System
 * 
 * Classifies iOS devices into performance tiers (LOW, MEDIUM, HIGH)
 * to adjust rendering load dynamically.
 */

export enum IOSTier {
    LOW = 'LOW',       // Older devices / Heavy constraints
    MEDIUM = 'MEDIUM', // Standard iPhones / Newer iPads
    HIGH = 'HIGH'      // Pro models (simulated or detected)
}

export interface TierSettings {
    blurQuality: 'low' | 'medium' | 'high'
    maxBlurStrength: number // Cap blur radius
    grainResolution: number // Scaling factor (1 = full res, 2 = half res)
    enableComplexBlending: boolean
}

const TIER_SETTINGS: Record<IOSTier, TierSettings> = {
    [IOSTier.LOW]: {
        blurQuality: 'low',
        maxBlurStrength: 20, // Strict Cap
        grainResolution: 2,  // Half resolution grain
        enableComplexBlending: false
    },
    [IOSTier.MEDIUM]: {
        blurQuality: 'medium',
        maxBlurStrength: 50,
        grainResolution: 1.5,
        enableComplexBlending: true
    },
    [IOSTier.HIGH]: {
        blurQuality: 'high',
        maxBlurStrength: 100,
        grainResolution: 1, // Full resolution
        enableComplexBlending: true
    }
}

/**
 * Heuristic detection of iOS performance tier.
 * Since accessing GPU info or RAM is restricted on iOS Safari,
 * we rely on screen dimensions and DPR.
 */
export function detectIOSTier(): IOSTier {
    if (typeof window === 'undefined') return IOSTier.MEDIUM

    const dpr = window.devicePixelRatio || 1
    const width = window.screen.width
    const height = window.screen.height
    const pixels = width * height * dpr * dpr

    // Heuristic:
    // iPhone 14 Pro Max: ~460 wide logical, dpr 3 -> ~2796x1290 physical -> ~3.6MP
    // Older phones: smaller or dpr 2.

    // MegaPixels
    const mp = pixels / 1_000_000

    // Strict cutoff for very old/constrained devices
    if (mp < 2) {
        return IOSTier.LOW
    }

    // High resolution usually implies stronger hardware on Apple devices,
    // BUT driving that many pixels is hard. 
    // However, specifically for the internal logic, we might want to LIMIT
    // effects on high-res screens because they are expensive to fill.
    // So "HIGH" tier might actually handle *more* pixels, OR we might treat
    // super-high-res as "Medium" to be safe.

    // Let's stick to "Hardware Capability" assumption:
    // If it's a newer device (Screen height > 800 logical), it's likely Performant.
    // iPhone X/11/12+ are tall.
    const logicalHeight = Math.max(width, height) // handle layout

    if (logicalHeight > 900) {
        // iPhone Pro Max territory or iPads
        return IOSTier.HIGH
    } else if (logicalHeight > 800) {
        // Modern iPhones
        return IOSTier.MEDIUM
    } else {
        // Older iPhones (SE, 6, 7, 8)
        return IOSTier.LOW
    }
}

export function getTierSettings(tier: IOSTier): TierSettings {
    return TIER_SETTINGS[tier]
}
