import {create} from "zustand"
import { processImage } from "../api/imageApi"

const useEditorStore = create((set,get)=>({
    originalImage : null,
    previewImage : null,
    operations : [],
    isLoading : false,

    setOriginalImage : (base64) => set({
        originalImage : base64,
        previewImage : base64,
        operations : []
    }),

    addOperation : async (op) => {
        const newOps = [...get().operations,op];
        set({operations:newOps,isLoading: true})
        const result = await processImage(get().originalImage,newOps)
        set({previewImage:result,isLoading:false})
    },

    undo : async() => {
        const newOps = get().operations.slice(0,-1)
        set({operations:newOps,isLoading:true})
        const result = newOps.length > 0 ?
            await processImage(get().originalImage,newOps)
            : get().originalImage
        set({previewImage:result, isLoading:false})
    },

    reset : ()=>{
        originalImage : null
        previewImage : null
        operations : []
    }

}))