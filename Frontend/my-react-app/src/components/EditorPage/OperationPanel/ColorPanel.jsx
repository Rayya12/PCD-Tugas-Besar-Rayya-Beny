import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function ColorPanel({format}){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [operation,setOperation] = useState("grayscale");
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleApply = () => {
        if (!isLoading){
            addOperation({
            type : "color_operation",
            params : {
                operation,
                format
            }
        });
        }
        
    }

    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "color_operation"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
};

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-white text-sm font-semibold">Color Operations</p>
            <select className="text-white font-semibold bg-gray-800 rounded-xl px-2 py-2 focus:ring focus:ring-violet-400" onChange={(e)=>{setOperation(e.target.value)}}>
                <option value="grayscale">Grayscale</option>
                <option value="hsv">HSV</option>
                <option value="lab">LAB</option>
                <option value="ycbcr">YCbCr</option>
                <option value="invert">Invert</option>
            </select>

            <div className="flex justify-between space-x-2">
                <button className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={handleRestore}>
                    {isLoading?"Loading...":"Restore"}
                </button>
                <button className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
                onClick={handleApply}>
                    {isLoading? "Loading..." : "Apply Color Operation"}
                </button>
            </div>
        </div>
    )
}