import useEditorStore from "../../../store/editorStore"
import { useState } from "react";

export default function ConvolutionPanel(){
    const addOperation = useEditorStore(s=>s.addOperation);
    const [kernel,setKernel] = useState([[0,0,0],[0,0,0],[0,0,0]]);
    const isLoading = useEditorStore(s=>s.isLoading);
    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);

    const handleRestore = () => {
        const existingIndex = operations.findIndex(
            (o) => o.type === "convolution"
        );
        if (existingIndex !== -1) {
            deleteOperation(existingIndex);
        }else{
            console.log("aman guys")
        }
    };

    const handleApply = () => {
        if (!isLoading){
            addOperation({
            type : "convolution",
            params : {
                kernel
                }
            });
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-white text-sm font-semibold">Convolution</p>
            <div className="flex flex-col gap-2">
                {kernel.map((row,rowIndex)=>(
                    <div key={rowIndex} className="flex gap-2">
                        {row.map((value,colIndex)=>(
                            <input
                                key={colIndex}
                                type="number"
                                value={value}
                                onChange={(e)=>{
                                    const newKernel = [...kernel];
                                    newKernel[rowIndex][colIndex] = Number(e.target.value);
                                    setKernel(newKernel);
                                }}
                                step={0.001}
                                className="w-16 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                            />
                        ))}
                    </div>
                ))}
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