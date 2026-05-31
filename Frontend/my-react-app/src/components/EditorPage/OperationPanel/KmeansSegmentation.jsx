import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function KmeansSegmentationPanel({ format }){

    const addOperation = useEditorStore(s=>s.addOperation);

    const handleApply = () => {
        addOperation({
            type : "KMsegmentation",
            params : { format, k, tol:tolerance, max_iter: maxIter }
        })
    }

    const isLoading = useEditorStore(s=>s.isLoading);
    const [k,setK] = useState(2);
    const [tolerance,setTolerance] = useState(0.0001);
    const [maxIter,setMaxIter] = useState(100);

    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);
    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "KMsegmentation"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
    };

    return (
        <div className = "flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">K-Means Segmentation</p>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-white text-sm">Number of Clusters (K):</label>
                    <input
                        type="number"
                        value={k}
                        onChange={(e)=>setK(Number(e.target.value))}
                        min={1}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-white text-sm">Tolerance:</label>
                    <input
                        type="number"
                        value={tolerance}
                        onChange={(e)=>setTolerance(Number(e.target.value))}
                        step={0.0001}
                        className="w-24 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-white text-sm">Maximum Iterations:</label>
                    <input
                        type="number"
                        value={maxIter}
                        onChange={(e)=>setMaxIter(Number(e.target.value))}
                        min={1}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
            </div>
            <div className="flex justify-between space-x-2">
                <button className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={handleRestore}>
                    {isLoading?"Loading...":"Restore"}
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
                onClick={handleApply}>
                    {isLoading? "Loading..." : "Apply"}
                </button>
            </div>
        </div>
    )
}