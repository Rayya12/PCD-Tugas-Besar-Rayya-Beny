import BrightnessPanel from "./OperationPanel/BrightnessPanel"
import ContrastAdjustPanel from "./OperationPanel/ContrastAjustPanel"
import EdgeDetectionPanel from "./OperationPanel/EdgeDetectionPanel"
import HistogramEqPanel from "./OperationPanel/HistogramEqPanel"
import RotatePanel from "./OperationPanel/RotatePanel"
import ConvolutionPanel from "./OperationPanel/ConvolutionPanel"
import FlipPanel from "./OperationPanel/FlipPanel"
import HistogramSpecPanel from "./OperationPanel/HistogramSpecPanel"
import ZoomPanel from "./OperationPanel/ZoomPanel"
import { useState } from "react"
import { useFormat } from "../../context/FormatContext"


export default function SideBar(){

    const { format, setFormat } = useFormat();
    return (
    <div className="flex flex-col h-full w-[360px] bg-gray-800 py-4 px-4 space-y-4 overflow-y-auto pb-12
    scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <h2 className="text-2xl text-white font-bold">Image Operation</h2>
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Output Format</label>
            <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="text-white font-semibold bg-gray-700 rounded-lg px-3 py-2 focus:ring focus:ring-violet-400"
            >
                <option value="PNG">PNG</option>
                <option value="JPEG">JPEG</option>
                <option value="BMP">BMP</option>
            </select>
        </div>
        <BrightnessPanel format={format}/>
        <ContrastAdjustPanel format={format}/>
        <FlipPanel format={format}/>
        <RotatePanel format={format}/>
        <ZoomPanel format={format}/>
        <EdgeDetectionPanel format={format}/>
        <HistogramEqPanel format={format}/>
        <HistogramSpecPanel format={format}/>
        <ConvolutionPanel format={format}/>
    </div>
    )
}