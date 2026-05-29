import useEditorStore from "../../../store/editorStore"
import { useState } from "react";

export default function HistogramSpecPanel(){

    const addOperation = useEditorStore(s=>s.addOperation);
    const [type, setType] = useState("gaussian");
    const [params, setParams] = useState({mean:128,std:30,sigma:50});

    const handleApply = () => {
        const hist = generateHistogram(type,params);
        addOperation({
            type : "histogram_specification",
            params : { histogram: hist }
        })
    }

    const generateHistogram = (type,params) => {
        const hist = new Array(256).fill(0);

        if (type === "gaussian"){
            const {mean,std} = params;
            for (let i=0;i<256;i++){
                hist[i] = Math.round(10000 * Math.exp(-0.5 * Math.pow((i - mean) / std, 2)));
            }
        }else if (type === "uniform"){
            hist.fill(1000);
        }
        else if (type === "rayleigh"){
            const {sigma} = params;
            for (let i=0;i<256;i++){
                hist[i] = Math.round(10000 * (i / sigma**2) * Math.exp(-(i**2) / (2 * sigma**2)));
            }
        }
        return hist;
    }

    const isLoading = useEditorStore(s=>s.isLoading);

    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);
    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "histogram_specification"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
    };

    return (
        <div className = "flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">Histogram Specification</p>
            <select className="text-white font-semibold bg-gray-800 rounded-xl px-2 py-2 focus:ring focus:ring-violet-400" onChange={(e)=>{setType(e.target.value)}}>
                <option value="gaussian">Gaussian</option>
                <option value="uniform">Uniform</option>
                <option value="rayleigh">Rayleigh</option>
            </select>

            {type === "gaussian" && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Mean</span>
                        <input
                            type="number"
                            value={params.mean}
                            onChange={(e)=>setParams({...params, mean: Number(e.target.value)})}
                            className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Std Dev</span>
                        <input
                            type="number"
                            value={params.std}
                            onChange={(e)=>setParams({...params, std: Number(e.target.value)})}
                            className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                        />
                    </div>
                </div>
            )}

            {type === "rayleigh" && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sigma</span>
                    <input
                        type="number"
                        value={params.sigma}
                        onChange={(e)=>setParams({...params, sigma: Number(e.target.value)})}
                        className="w-20 p-1 rounded bg-gray-800 text-white text-center focus:ring focus:ring-violet-400"
                    />
                </div>
            )}

               
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