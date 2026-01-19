/**
 * Platform detection module for GRYD.
 * Classifies devices into IOS or NON_IOS hierarchies.
 * 
 * Logic ensures iPadOS is correctly detected even when requesting Desktop Site.
 */

export interface PlatformState {
    isIOS: boolean      // True for iPhone, iPod, iPad (including desktop-mode iPad)
    isWebKit: boolean   // True for any WebKit-based browser
    isIOSDevice: boolean // Specifically checks for iOS hardware signatures
}

export type PlatformConfig = {
    userAgent: string
    platform: string
    maxTouchPoints: number
    vendor: string
}

/**
 * Detects the current platform based on browser environment capabilities.
 * Accepts an optional config object for unit testing.
 */
export function detectPlatform(config?: PlatformConfig): PlatformState {
    // defaults to global window/navigator if config is not provided
    const ua = config?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
    const plat = config?.platform || (typeof navigator !== 'undefined' ? navigator.platform : '')
    const touchPoints = config?.maxTouchPoints ?? (typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0)
    const vendor = config?.vendor || (typeof navigator !== 'undefined' ? navigator.vendor : '')

    // Basic UA Regex
    const isIPhone = /iPhone/.test(ua)
    const isIPad = /iPad/.test(ua)
    const isIPod = /iPod/.test(ua)

    // WebKit detection
    // Note: Chrome on iOS is WebKit, Safari is WebKit.
    const isWebKit = /AppleWebKit/.test(ua) && !/Chrome/.test(ua) && !/Edg/.test(ua) && !/Firefox/.test(ua) || (/CriOS/.test(ua) || /FxiOS/.test(ua))

    // iPadOS 13+ detection (Request Desktop Site acts as Macintosh)
    // Key differentiator: 'MacIntel' platform but has touch points
    const isIpadOS = plat === 'MacIntel' && touchPoints > 1

    // isIOS means the Operating System is iOS or iPadOS
    const isIOS = isIPhone || isIPad || isIPod || isIpadOS

    // isIOSDevice is a hardware check (usually synonymous with isIOS in browser context)
    const isIOSDevice = isIOS

    return {
        isIOS,
        isWebKit: isWebKit || isIOS, // All browsers on iOS are WebKit-based (historically)
        isIOSDevice
    }
}

// Singleton state for immediate consumption
export const { isIOS, isWebKit, isIOSDevice } = detectPlatform()
