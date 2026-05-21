import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function EdgeDetectionPanel(){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [method,setMethod] = useState("sobel");
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleApply = () => {
        if (!isLoading){
            addOperation({
            type : "edge_detection",
            params : {
                method
            }
        });
        }
        
    }

    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "edge_detection"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
};

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-white text-sm font-semibold">Detect Edges</p>
            <select className="text-white font-semibold bg-gray-800 rounded-xl px-2 py-2 focus:ring focus:ring-violet-400" onChange={(e)=>{setMethod(e.target.value)}}>
                <option value="sobel">Sobel</option>
                <option value="prewitt">Prewitt</option>
                <option value="canny">Canny</option>
            </select>

            <div className="flex justify-between space-x-2">
                <button className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={handleRestore}>
                    {isLoading?"Loading...":"Restore"}
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
                onClick={handleApply}>
                    {isLoading? "Loading..." : "Edge Detection"}
                </button>
            </div>
        </div>
    )
}