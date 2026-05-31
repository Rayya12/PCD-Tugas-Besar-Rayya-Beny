import useEditorStore from "../../../store/editorStore"


export default function FlipPanel({ format }){
    const addOperation = useEditorStore(s=>s.addOperation);
    const isLoading = useEditorStore(s=>s.isLoading);

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-sm font-semibold text-white">Flip Image</p>
            <div className="flex justify-between space-x-2">
                <button className = {`flex-1 py-2 rounded-lg text-sm ${isLoading ? "text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={()=>{
                    if (!isLoading){
                        addOperation({
                            type : "flip",
                            params : {
                                mode : "horizontal",
                                format
                            }
                        })
                    }
                }}>
                    {isLoading ? "Loading..." : "Flip Horizontal"}
                </button>
                <button className = {`flex-1 py-2 rounded-lg text-sm ${isLoading ? "text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
                onClick={()=>{
                    if (!isLoading){
                        addOperation({
                            type : "flip",
                            params : {
                                mode : "vertical"
                            }
                        })
                    }
                }}>
                    {isLoading ? "Loading..." : "Flip Vertical"}
                </button>
            </div>
        </div>
    )

}
