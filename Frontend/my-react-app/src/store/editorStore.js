import { create } from "zustand"
import { processImage } from "../api/imageApi"

// Operasi yang hanya boleh ada 1 di stack (replace, tidak stacking)
const SINGLE_ONLY_OPS = [
    "brightness",
    "contrast",
    "rotate",
    "edge_detection",
    "histogram_equalization",
    "histogram_specification",
    "grayscale",
    "zoom",
    "saturation",
    "convolution",
    "smoothing",
    "KMsegmentation",
    "SAMsegmentation"
]

export const useEditorStore = create((set, get) => ({
    originalImage: null,
    previewImage: null,
    operations: [],
    isLoading: false,
    originalHeight : 0,
    originalWidth: 0,

    setOriginalImage: (base64,width,height) => set({
        originalImage: base64,
        previewImage: base64,
        operations: [],
        originalWidth : width,
        originalHeight : height,
    }),

    addOperation: async (op) => {
        // Cek apakah operasi ini termasuk single-only
        const existingIndex = SINGLE_ONLY_OPS.includes(op.type)
            ? get().operations.findIndex(o => o.type === op.type)
            : -1

        let newOps
        if (existingIndex !== -1) {
            // Sudah ada → replace di posisi yang sama
            newOps = get().operations.map((o, i) => i === existingIndex ? op : o)
        } else {
            // Belum ada → append
            newOps = [...get().operations, op]
        }

        set({ operations: newOps, isLoading: true })

        try {
            const result = await processImage(get().originalImage, newOps)
            set({ previewImage: result, isLoading: false })
        } catch (e) {
            // Rollback ke operations sebelumnya
            set({ operations: get().operations, isLoading: false })
            console.error(e.message || e.detail || "Gagal melakukan operasi")
        } finally {
            set({ isLoading: false })
        }
    },

    deleteOperation: async (index) => {
        const newOps = get().operations.filter((_, i) => i !== index)
        set({ operations: newOps, isLoading: true })

        try {
            if (newOps.length === 0) {
                set({ previewImage: get().originalImage, isLoading: false })
            } else {
                const result = await processImage(get().originalImage, newOps)
                set({ previewImage: result, isLoading: false })
            }
        } catch (e) {
            set({ operations: get().operations, isLoading: false })
            console.error(e.message || e.detail || "Gagal menghapus operasi")
        } finally {
            set({ isLoading: false })
        }
    },

    undo: async () => {
        const newOps = get().operations.slice(0, -1)
        set({ operations: newOps, isLoading: true })

        try {
            const result = newOps.length > 0
                ? await processImage(get().originalImage, newOps)
                : get().originalImage
            set({ previewImage: result, isLoading: false })
        } catch (e) {
            set({ operations: get().operations, isLoading: false })
            console.error(e.message || e.detail || "Gagal undo operasi")
        } finally {
            set({ isLoading: false })
        }
    },

    reset: () => set({
        originalImage: null,
        previewImage: null,
        operations: []
    })
}))

export default useEditorStore