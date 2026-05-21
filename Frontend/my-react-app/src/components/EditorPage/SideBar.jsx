import BrightnessPanel from "./OperationPanel/BrightnessPanel"
import EdgeDetectionPanel from "./OperationPanel/EdgeDetectionPanel"

export default function SideBar(){
    return (
    <div className="flex flex-col min-h-full w-[360px] bg-gray-800 py-4 px-4 space-y-4">
        <h2 className="text-2xl text-white font-bold">Image Operation</h2>
        <BrightnessPanel/>
        <EdgeDetectionPanel/>
    </div>
    )
}