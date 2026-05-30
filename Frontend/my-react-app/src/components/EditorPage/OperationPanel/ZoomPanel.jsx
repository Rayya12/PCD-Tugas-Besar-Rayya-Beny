import useEditorStore from "../../../store/editorStore"
import { useState } from "react";

export default function ZoomPanel(){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [scale, setScale] = useState(1);
    const [center,setCenter] = useState(false);
    const [anchor,setAnchor] = useState([300,300]);
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleApply = () => {
        if (!isLoading){
            addOperation({
                type : "zoom",
                params : {
                    scale,
                    isCenter: center,
                    point: anchor
                }
            })
        }
    }

    const handleReset = () => {
        const existingIndex = operations.findIndex(
            (o) => o.type === "zoom"
        );
        if (existingIndex !== -1) {
            setScale(1);
            setAnchor([300,300]);
            deleteOperation(existingIndex);
        }else{
            setScale(1);
            setAnchor([300,300]);
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">Zoom</p>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Scale:</span>
                    <input
                        type="number"
                        value={scale}
                        onChange={(e)=>setScale(Number(e.target.value))}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
                    <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Center Zoom:</span>
                    <input
                        type="checkbox"
                        checked={center}
                        onChange={(e)=>setCenter(e.target.checked)}
                        className="w-5 h-5 rounded bg-gray-800 text-white focus:ring focus:ring-violet-400"
                    />
                </div>
            {!center && ( <>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Anchor X:</span>
                    <input
                        type="number"
                        value={anchor[0]}
                        onChange={(e)=>setAnchor([Number(e.target.value), anchor[1]])}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Anchor Y:</span>
                    <input
                        type="number"
                        value={anchor[1]}
                        onChange={(e)=>setAnchor([anchor[0], Number(e.target.value)])}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
                    </>)}  
            </div>
            <div className="flex justify-between space-x-2">
                <button className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={handleReset}>
                    {isLoading?"Loading...":"Reset"}
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
                onClick={handleApply}>
                    {isLoading? "Loading..." : "Apply"}
                </button>
            </div>
        </div>
    )
}
