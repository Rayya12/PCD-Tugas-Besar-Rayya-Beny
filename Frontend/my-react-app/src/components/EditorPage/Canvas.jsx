import useEditorStore from "../../store/editorStore";
import { downloadImage } from "../../api/imageApi";
import { useFormat } from "../../context/FormatContext";
import { useEffect, useRef, useState } from "react";

// ──────────────────────────────────────────────
// Image Panel
// ──────────────────────────────────────────────

function ImagePanel({ src, alt, label }) {
    return (
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-5 w-full max-w-4xl">
            <p className="text-2xl font-semibold text-white mb-4 text-center">{label}</p>
            <div className="flex justify-center overflow-hidden rounded-xl bg-black">
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[500px] w-auto object-contain rounded-xl transition duration-300 hover:scale-[1.01]"
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────

function EmptyState({ text }) {
    return (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl h-[250px] w-full max-w-4xl bg-gray-900">
            <p className="text-gray-400 text-lg">{text}</p>
        </div>
    );
}

// ──────────────────────────────────────────────
// Histogram Utils
// ──────────────────────────────────────────────

function computeHistogram(imageBase64, callback) {
    const img = new Image()
    img.onload = () => {
        const offscreen = document.createElement("canvas")
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext("2d")
        ctx.drawImage(img, 0, 0)

        const { data } = ctx.getImageData(0, 0, img.width, img.height)

        const histR = new Array(256).fill(0)
        const histG = new Array(256).fill(0)
        const histB = new Array(256).fill(0)
        const histL = new Array(256).fill(0)

        for (let i = 0; i < data.length; i += 4) {
            histR[data[i]]++
            histG[data[i + 1]]++
            histB[data[i + 2]]++
            const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
            histL[lum]++
        }

        callback({ histR, histG, histB, histL })
    }
    img.src = imageBase64
}

function drawHistogram(canvas, histData, activeChannel) {
    const ctx = canvas.getContext("2d")
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#111827"
    ctx.fillRect(0, 0, W, H)

    const channels = {
        R: { hist: histData.histR, color: "rgba(239, 68, 68, 0.8)" },
        G: { hist: histData.histG, color: "rgba(34, 197, 94, 0.8)" },
        B: { hist: histData.histB, color: "rgba(59, 130, 246, 0.8)" },
        L: { hist: histData.histL, color: "rgba(200, 200, 200, 0.8)" },
    }

    const toRender = activeChannel === "RGB" ? ["R", "G", "B"] : [activeChannel]
    const maxVal = Math.max(...toRender.flatMap(ch => channels[ch].hist))
    if (maxVal === 0) return

    const barW = W / 256

    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
        const y = (H / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
    }

    for (const ch of toRender) {
        const { hist, color } = channels[ch]
        ctx.fillStyle = color
        for (let i = 0; i < 256; i++) {
            const barH = (hist[i] / maxVal) * H
            ctx.fillRect(i * barW, H - barH, barW + 0.5, barH)
        }
    }
}

function HistogramCanvas({ imageBase64, activeChannel }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!imageBase64 || !canvasRef.current) return
        computeHistogram(imageBase64, (histData) => {
            drawHistogram(canvasRef.current, histData, activeChannel)
        })
    }, [imageBase64, activeChannel])

    return (
        <canvas ref={canvasRef} width={512} height={100} className="w-full h-24 rounded-lg" />
    )
}

function HistogramCard({ label, imageBase64, activeChannel }) {
    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 w-full max-w-4xl">
            <p className="text-sm font-semibold text-white mb-3">{label}</p>
            {imageBase64 ? (
                <HistogramCanvas imageBase64={imageBase64} activeChannel={activeChannel} />
            ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-600 text-xs">Tidak ada data</p>
                </div>
            )}
        </div>
    )
}

function HistogramPanel({ activeChannel, setActiveChannel }) {
    const originalImage = useEditorStore(s => s.originalImage)
    const previewImage = useEditorStore(s => s.previewImage)

    const CHANNELS = ["RGB", "R", "G", "B", "L"]
    const CHANNEL_LABELS = { RGB: "All", R: "Red", G: "Green", B: "Blue", L: "Luminance" }

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex gap-2">
                {CHANNELS.map(ch => (
                    <button
                        key={ch}
                        onClick={() => setActiveChannel(ch)}
                        className={`
                            px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                            ${activeChannel === ch
                                ? ch === "R" ? "bg-red-600 text-white"
                                : ch === "G" ? "bg-green-600 text-white"
                                : ch === "B" ? "bg-blue-600 text-white"
                                : "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                            }
                        `}
                    >
                        {CHANNEL_LABELS[ch]}
                    </button>
                ))}
            </div>
            <HistogramCard label="Histogram — Original" imageBase64={originalImage} activeChannel={activeChannel} />
            <HistogramCard label="Histogram — Result" imageBase64={previewImage} activeChannel={activeChannel} />
        </div>
    )
}

// ──────────────────────────────────────────────
// HSV Utils
// ──────────────────────────────────────────────

function computeHSV(imageBase64, callback) {
    const img = new Image()
    img.onload = () => {
        const offscreen = document.createElement("canvas")
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext("2d")
        ctx.drawImage(img, 0, 0)

        const { data } = ctx.getImageData(0, 0, img.width, img.height)

        const histH = new Array(360).fill(0)
        const histS = new Array(100).fill(0)
        const histV = new Array(100).fill(0)

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255
            const g = data[i + 1] / 255
            const b = data[i + 2] / 255

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const delta = max - min

            // Value
            histV[Math.min(Math.floor(max * 100), 99)]++

            // Saturation
            const s = max === 0 ? 0 : delta / max
            histS[Math.min(Math.floor(s * 100), 99)]++

            // Hue
            let h = 0
            if (delta !== 0) {
                if (max === r)      h = ((g - b) / delta) % 6
                else if (max === g) h = (b - r) / delta + 2
                else                h = (r - g) / delta + 4
                h = Math.round(h * 60)
                if (h < 0) h += 360
            }
            histH[Math.min(h, 359)]++
        }

        callback({ histH, histS, histV })
    }
    img.src = imageBase64
}

function HSVCanvas({ hist, color }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current || !hist) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const W = canvas.width
        const H = canvas.height

        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = "#111827"
        ctx.fillRect(0, 0, W, H)

        const maxVal = Math.max(...hist)
        if (maxVal === 0) return

        // Grid
        ctx.strokeStyle = "rgba(255,255,255,0.05)"
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath()
            ctx.moveTo(0, (H / 4) * i)
            ctx.lineTo(W, (H / 4) * i)
            ctx.stroke()
        }

        const barW = W / hist.length
        for (let i = 0; i < hist.length; i++) {
            const barH = (hist[i] / maxVal) * H
            ctx.fillStyle = color === "hue" ? `hsla(${i}, 100%, 50%, 0.85)` : color
            ctx.fillRect(i * barW, H - barH, barW + 0.5, barH)
        }
    }, [hist, color])

    return <canvas ref={canvasRef} width={512} height={80} className="w-full h-20 rounded-lg" />
}

function HSVCard({ imageBase64 }) {
    const [hsvData, setHsvData] = useState(null)

    useEffect(() => {
        if (!imageBase64) { setHsvData(null); return }
        computeHSV(imageBase64, setHsvData)
    }, [imageBase64])

    if (!imageBase64) return null

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 w-full max-w-4xl">
            <p className="text-lg font-semibold text-white mb-4">HSV Analysis — Original Image</p>

            {hsvData ? (
                <div className="flex flex-col gap-5">

                    {/* Hue */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-gray-400">Hue (0° – 360°)</span>
                            <span className="text-xs text-gray-600">warna dominan</span>
                        </div>
                        <HSVCanvas hist={hsvData.histH} color="hue" />
                        <div className="flex justify-between mt-1 text-gray-600 text-xs">
                            <span>0° Red</span>
                            <span>60° Yellow</span>
                            <span>120° Green</span>
                            <span>180° Cyan</span>
                            <span>240° Blue</span>
                            <span>300° Magenta</span>
                            <span>360°</span>
                        </div>
                    </div>

                    {/* Saturation & Value */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-gray-400">Saturation (0–100%)</span>
                                <span className="text-xs text-gray-600">kepekatan warna</span>
                            </div>
                            <HSVCanvas hist={hsvData.histS} color="rgba(168, 85, 247, 0.8)" />
                            <div className="flex justify-between mt-1 text-gray-600 text-xs">
                                <span>0% (abu)</span>
                                <span>100% (pekat)</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-gray-400">Value (0–100%)</span>
                                <span className="text-xs text-gray-600">kecerahan</span>
                            </div>
                            <HSVCanvas hist={hsvData.histV} color="rgba(250, 204, 21, 0.8)" />
                            <div className="flex justify-between mt-1 text-gray-600 text-xs">
                                <span>0% (gelap)</span>
                                <span>100% (terang)</span>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="h-24 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────
// Main Canvas
// ──────────────────────────────────────────────

export default function Canvas() {
    const originalImage = useEditorStore((s) => s.originalImage)
    const previewImage = useEditorStore((s) => s.previewImage)
    const originalWidth = useEditorStore(s => s.originalWidth)
    const originalHeight = useEditorStore(s => s.originalHeight)
    const { format } = useFormat()
    const [activeChannel, setActiveChannel] = useState("RGB")

    return (
        <div className="min-h-screen w-full bg-gray-950 px-6 py-10 overflow-y-auto">
            <div className="flex flex-col items-center gap-10">

                {/* Original Image */}
                {originalImage ? (
                    <>
                        <div className="flex p-4 rounded-xl border border-gray-700">
                            <p className="text-white font-bold">
                                Original Image Size: {originalWidth} x {originalHeight}
                            </p>
                        </div>
                        <ImagePanel
                            src={originalImage}
                            alt="original image before transformation"
                            label="Original Image"
                        />
                    </>
                ) : (
                    <EmptyState text="Belum ada gambar original" />
                )}

                {/* Preview Image */}
                {previewImage ? (
                    <ImagePanel
                        src={previewImage}
                        alt="image after transformation"
                        label="Image After Transformation"
                    />
                ) : (
                    <EmptyState text="Preview hasil edit akan muncul di sini" />
                )}

                {/* HSV — hanya untuk original */}
                <HSVCard imageBase64={originalImage} />

                {/* Histogram */}
                {(originalImage || previewImage) && (
                    <HistogramPanel
                        activeChannel={activeChannel}
                        setActiveChannel={setActiveChannel}
                    />
                )}

            </div>

            {/* Download */}
            <div className="flex justify-center">
                <button
                    onClick={() => previewImage && downloadImage(previewImage, `edited-image.${format.toLowerCase()}`)}
                    disabled={!previewImage}
                    className="mt-10 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-800 disabled:text-gray-400"
                >
                    Download Image
                </button>
            </div>
        </div>
    )
}