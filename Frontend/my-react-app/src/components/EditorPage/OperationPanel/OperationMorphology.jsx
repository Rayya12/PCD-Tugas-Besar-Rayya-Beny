import useEditorStore from "../../../store/editorStore";
import { useState } from "react";

export default function MorphologyPanel({format}){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [operation, setOperation] = useState("dilation");
    const [se, setSE] = useState([[0,1,0],[1,1,1],[0,1,0]]);
    const [origin, setOrigin] = useState([1,1]);
    const [threshold, setThreshold] = useState(128);
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleApply = () => {
        if (!isLoading){
            addOperation({
            type : "morphological",
            params : {
                se,
                operation,
                origin,
                format,
                threshold
            }
        });
        }
        
    }

    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "morphological"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
};

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-white text-sm font-semibold">Morphological Operations</p>
            <select className="text-white font-semibold bg-gray-800 rounded-xl px-2 py-2 focus:ring focus:ring-violet-400" onChange={(e)=>{setOperation(e.target.value)}}>
                <option value="dilation">Dilation</option>
                <option value="erosion">Erosion</option>
                <option value="opening">Opening</option>
                <option value="closing">Closing</option>
            </select>

            <div className="flex flex-col gap-2">
                {se.map((row,rowIndex)=>(
                    <div key={rowIndex} className="flex gap-2">
                        {row.map((value,colIndex)=>(
                            <input
                                key={colIndex}
                                type="number"
                                value={value}
                                max={1}
                                min={0}
                                onChange={(e)=>{
                                    const newSE = [...se];
                                    newSE[rowIndex][colIndex] = Number(e.target.value);
                                    setSE(newSE);
                                }}
                                step={1}
                                className="w-16 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Origin (x,y)</span>
                <input
                    type="number"
                    value={origin[0]}
                    min={0}
                    max={2}
                    onChange={(e)=>setOrigin([Number(e.target.value), origin[1]])}
                    step={1}
                    className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                />
                <input
                    type="number"
                    value={origin[1]}
                    min={0}
                    max={2}
                    onChange={(e)=>setOrigin([origin[0], Number(e.target.value)])}
                    step={1}
                    className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Threshold (for RGB images)</span>
                <input
                    type="number"
                    value={threshold}
                    min={0}
                    max={255}
                    onChange={(e)=>setThreshold(Number(e.target.value))}
                    step={1}
                    className="w-24 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                />
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