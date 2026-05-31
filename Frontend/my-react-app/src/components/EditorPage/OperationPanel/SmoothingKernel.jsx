import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function SmoothingPanel({format}){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [method,setMethod] = useState("mean");
    const [kernelSize,setKernelSize] = useState(3);
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleApply = () => {
        if (!isLoading){
            addOperation({
            type : "smoothing",
            params : {
                type: method,
                kernel_size: kernelSize,
                format
            }
        });
        }
    }


    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "smoothing"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
};

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-white text-sm font-semibold">Smoothing</p>
            <select className="text-white font-semibold bg-gray-800 rounded-xl px-2 py-2 focus:ring focus:ring-violet-400" onChange={(e)=>{setMethod(e.target.value)}}>
                <option value="mean">Mean</option>
                <option value="median">Median</option>
            </select>

            <div className="flex items-center gap-2">
                <label className="text-white text-sm">Kernel Size:</label>
                <input
                    type="number"
                    value={kernelSize}
                    onChange={(e)=>setKernelSize(Number(e.target.value))}
                    min={1}
                    max={15}
                    step={2}
                    className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                />
            </div>

            <div className="flex justify-between space-x-2">
                <button className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={handleRestore}>
                    {isLoading?"Loading...":"Restore"}
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
                onClick={handleApply}>
                    {isLoading? "Loading..." : "Apply Smoothing"}
                </button>
            </div>
        </div>
    )
}