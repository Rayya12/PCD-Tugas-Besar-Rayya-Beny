// src/components/UploadPage/UploadPage.jsx

import { useRef, useState } from "react"
import { uploadImage } from "../../api/imageApi"
import useEditorStore from "../../store/editorStore"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const setOriginalImage = useEditorStore(s => s.setOriginalImage)

  const handleFile = async (file) => {
    if (!file) return

    const allowed = ["image/jpeg", "image/png", "image/bmp"]
    if (!allowed.includes(file.type)) {
      setError("Format tidak didukung. Gunakan JPG, PNG, atau BMP.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.")
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      const data = await uploadImage(file)
      setOriginalImage(data.image_base64)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🖼 Image Editor</h1>
          <p className="text-gray-400">Upload gambar untuk mulai mengedit</p>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => !isLoading && fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          className={`
            w-[480px] h-[280px] rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3
            transition-all duration-200 cursor-pointer
            ${isDragging
              ? "border-indigo-500 bg-indigo-950/30 scale-105"
              : "border-gray-700 bg-gray-900 hover:border-indigo-500 hover:bg-gray-800"
            }
            ${isLoading ? "cursor-not-allowed opacity-60" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-10 h-10 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Mengupload gambar...</p>
            </>
          ) : (
            <>
              <span className="text-5xl">📁</span>
              <p className="text-white font-medium">
                {isDragging ? "Lepaskan gambar di sini" : "Drag & drop gambar di sini"}
              </p>
              <p className="text-gray-500 text-sm">atau klik untuk pilih file</p>
              <p className="text-gray-600 text-xs">JPG, PNG, BMP — Maksimal 10MB</p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/50 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/bmp"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />

      </div>
    </div>
  )
}