import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function SplitAndMergeSegmentationPanel({ format }){

    const addOperation = useEditorStore(s=>s.addOperation);

    const handleApply = () => {
        addOperation({
            type : "SAMsegmentation",
            params : { format, min_size, homogeneity_threshold }
        })
    }

    const isLoading = useEditorStore(s=>s.isLoading);
    const [min_size,setMinSize] = useState(8);
    const [homogeneity_threshold,setHomogeneityThreshold] = useState(10.0);

    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);
    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "SAMsegmentation"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
    };

    return (
        <div className = "flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">Split-and-Merge Segmentation</p>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-white text-sm">Minimum Region Size:</label>
                    <input
                        type="number"
                        value={min_size}
                        onChange={(e) => setMinSize(parseInt(e.target.value))}
                        className="bg-gray-800 text-white placeholder:text-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-white text-sm">Homogeneity Threshold:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={homogeneity_threshold}
                        onChange={(e) => setHomogeneityThreshold(parseFloat(e.target.value))}
                        className="bg-gray-800 text-white placeholder:text-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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