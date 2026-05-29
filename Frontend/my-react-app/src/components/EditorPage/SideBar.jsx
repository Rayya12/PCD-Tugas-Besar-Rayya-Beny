import BrightnessPanel from "./OperationPanel/BrightnessPanel"
import ContrastAdjustPanel from "./OperationPanel/ContrastAjustPanel"
import EdgeDetectionPanel from "./OperationPanel/EdgeDetectionPanel"
import HistogramEqPanel from "./OperationPanel/HistogramEqPanel"
import RotatePanel from "./OperationPanel/RotatePanel"
import ConvolutionPanel from "./OperationPanel/ConvolutionPanel"

export default function SideBar(){
    return (
    <div className="flex flex-col h-full w-[360px] bg-gray-800 py-4 px-4 space-y-4 overflow-y-auto pb-12
    scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <h2 className="text-2xl text-white font-bold">Image Operation</h2>
        <BrightnessPanel/>
        <ContrastAdjustPanel/>
        <RotatePanel/>
        <EdgeDetectionPanel/>
        <HistogramEqPanel/>
        <ConvolutionPanel/>
    </div>
    )
}