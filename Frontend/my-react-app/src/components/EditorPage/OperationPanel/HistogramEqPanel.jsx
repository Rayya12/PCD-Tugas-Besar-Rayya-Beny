import useEditorStore from "../../../store/editorStore"

export default function HistogramEqPanel(){

    const addOperation = useEditorStore(s=>s.addOperation);

    const handleApply = () => {
        addOperation({
            type : "histogram_equalization",
            params : {}
        })
    }

    const isLoading = useEditorStore(s=>s.isLoading);

    const operations = useEditorStore(s=>s.operations);
    const deleteOperation = useEditorStore(s=>s.deleteOperation);
    const handleRestore = () => {
    const existingIndex = operations.findIndex(
        (o) => o.type === "histogram_equalization"
    );

    if (existingIndex !== -1) {
        deleteOperation(existingIndex);
    }else{
        console.log("aman guys")
    }
    };

    return (
        <div className = "flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">Histogram Equalization</p>
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