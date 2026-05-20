import {create} from "zustand"
import { processImage } from "../api/imageApi"
import { use } from "react";

export const useEditorStore = create((set,get)=>({
    originalImage : null,
    previewImage : null,
    operations : [],
    isLoading : false,

    setOriginalImage : (base64) => set({
        originalImage : base64,
        previewImage : base64,
        operations : []
    }),

    addOperation: async (op) => {
    const newOps = [...get().operations, op]
    set({ operations: newOps, isLoading: true })

    try {
        const result = await processImage(get().originalImage, newOps)
        set({ previewImage: result, isLoading: false })
    } catch (e) {
        set({ operations: get().operations.slice(0, -1), isLoading: false })
        console.error(e.message || e.detail || "Gagal melakukan operasi")
    } finally {
        set({ isLoading: false })
    }
},

    undo : async() => {
        const newOps = get().operations.slice(0,-1)
        set({operations:newOps,isLoading:true})
        const result = newOps.length > 0 ?
            await processImage(get().originalImage,newOps)
            : get().originalImage
        set({previewImage:result, isLoading:false})
    },

    reset : ()=>set({
        originalImage : null,
        previewImage : null,
        operations : []})
    }

))

export default useEditorStore;