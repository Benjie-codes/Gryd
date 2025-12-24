import React, { useState, useCallback } from 'react'
import { useGrydStore } from '../store/compositionStore'
import { ExportService, ImageFormat, ImageResolution, ColorFormat } from '../core/ExportService'

interface ExportModalProps {
    isOpen: boolean
    onClose: () => void
}

type ExportTab = 'image' | 'css'

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const composition = useGrydStore(state => state.composition)

    // Image export state
    const [imageFormat, setImageFormat] = useState<ImageFormat>('png')
    const [imageResolution, setImageResolution] = useState<ImageResolution>('2k')
    const [isExporting, setIsExporting] = useState(false)

    // CSS export state
    const [colorFormat, setColorFormat] = useState<ColorFormat>('hex')
    const [minified, setMinified] = useState(false)
    const [includeFilters, setIncludeFilters] = useState(true)
    const [copied, setCopied] = useState(false)

    // Tab state
    const [activeTab, setActiveTab] = useState<ExportTab>('image')

    // Handle image export
    const handleExportImage = useCallback(async () => {
        setIsExporting(true)
        try {
            await ExportService.downloadImage(composition, {
                format: imageFormat,
                resolution: imageResolution,
                aspectRatio: 'square',
            })
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }, [composition, imageFormat, imageResolution])

    // Generate CSS preview
    const cssOutput = ExportService.generateCSS(composition, {
        colorFormat,
        minified,
        includeFilters,
    })

    // Handle copy to clipboard
    const handleCopyCSS = useCallback(async () => {
        const success = await ExportService.copyToClipboard(cssOutput)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [cssOutput])

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="export-modal-backdrop" onClick={handleBackdropClick}>
            <div className="export-modal">
                {/* Header */}
                <div className="export-modal-header">
                    <h2 className="export-modal-title">Export</h2>
                    <button className="export-modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="export-tabs">
                    <button
                        className={`export-tab ${activeTab === 'image' ? 'active' : ''}`}
                        onClick={() => setActiveTab('image')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Image
                    </button>
                    <button
                        className={`export-tab ${activeTab === 'css' ? 'active' : ''}`}
                        onClick={() => setActiveTab('css')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                        CSS
                    </button>
                </div>

                {/* Content */}
                <div className="export-modal-content">
                    {activeTab === 'image' && (
                        <div className="export-image-section">
                            {/* Format */}
                            <div className="export-control-group">
                                <label className="export-label">Format</label>
                                <div className="export-button-group">
                                    <button
                                        className={`export-option-btn ${imageFormat === 'png' ? 'active' : ''}`}
                                        onClick={() => setImageFormat('png')}
                                    >
                                        PNG
                                    </button>
                                    <button
                                        className={`export-option-btn ${imageFormat === 'jpeg' ? 'active' : ''}`}
                                        onClick={() => setImageFormat('jpeg')}
                                    >
                                        JPG
                                    </button>
                                </div>
                            </div>

                            {/* Resolution */}
                            <div className="export-control-group">
                                <label className="export-label">Resolution</label>
                                <div className="export-button-group">
                                    <button
                                        className={`export-option-btn ${imageResolution === '2k' ? 'active' : ''}`}
                                        onClick={() => setImageResolution('2k')}
                                    >
                                        2K
                                        <span className="export-option-detail">2048×2048</span>
                                    </button>
                                    <button
                                        className={`export-option-btn ${imageResolution === '4k' ? 'active' : ''}`}
                                        onClick={() => setImageResolution('4k')}
                                    >
                                        4K
                                        <span className="export-option-detail">4096×4096</span>
                                    </button>
                                    <button
                                        className={`export-option-btn ${imageResolution === '8k' ? 'active' : ''}`}
                                        onClick={() => setImageResolution('8k')}
                                    >
                                        8K
                                        <span className="export-option-detail">8192×8192</span>
                                    </button>
                                </div>
                            </div>

                            {/* Download button */}
                            <button
                                className="export-primary-btn"
                                onClick={handleExportImage}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <>
                                        <span className="export-spinner" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download {imageFormat.toUpperCase()}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'css' && (
                        <div className="export-css-section">
                            {/* Color Format */}
                            <div className="export-control-group">
                                <label className="export-label">Color Format</label>
                                <div className="export-button-group">
                                    <button
                                        className={`export-option-btn ${colorFormat === 'hex' ? 'active' : ''}`}
                                        onClick={() => setColorFormat('hex')}
                                    >
                                        Hex
                                    </button>
                                    <button
                                        className={`export-option-btn ${colorFormat === 'rgb' ? 'active' : ''}`}
                                        onClick={() => setColorFormat('rgb')}
                                    >
                                        RGB
                                    </button>
                                    <button
                                        className={`export-option-btn ${colorFormat === 'hsl' ? 'active' : ''}`}
                                        onClick={() => setColorFormat('hsl')}
                                    >
                                        HSL
                                    </button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="export-control-group">
                                <label className="export-label">Options</label>
                                <div className="export-checkbox-group">
                                    <label className="export-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={minified}
                                            onChange={(e) => setMinified(e.target.checked)}
                                        />
                                        <span>Minified output</span>
                                    </label>
                                    <label className="export-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={includeFilters}
                                            onChange={(e) => setIncludeFilters(e.target.checked)}
                                        />
                                        <span>Include filters</span>
                                    </label>
                                </div>
                            </div>

                            {/* CSS Preview */}
                            <div className="export-control-group">
                                <label className="export-label">Preview</label>
                                <pre className="export-css-preview">
                                    <code>{cssOutput}</code>
                                </pre>
                            </div>

                            {/* Copy button */}
                            <button
                                className="export-primary-btn"
                                onClick={handleCopyCSS}
                            >
                                {copied ? (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy to Clipboard
                                    </>
                                )}
                            </button>

                            {/* CSS Limitation Note */}
                            <p className="export-note">
                                Note: CSS gradients approximate the canvas rendering.
                                Blur and blend effects may differ.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ExportModal
