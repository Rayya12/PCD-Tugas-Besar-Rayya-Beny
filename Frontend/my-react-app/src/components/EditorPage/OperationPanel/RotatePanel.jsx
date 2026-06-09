import { useState } from "react"
import useEditorStore from "../../../store/editorStore"

export default function RotatePanel({ format }) {
  const [angle, setAngle] = useState(0);
  const addOperation = useEditorStore(s => s.addOperation);
  const [errorMessage,setErrorMessage] = useState("");
  const isLoading = useEditorStore(s=>s.isLoading);

  const handleApply = () => {
    if (!isLoading){
      addOperation({
      type: "rotate",
      params: { angle, format }
    })
    }
    
  }

  const handleReset = () => setAngle(0);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
      <p className="text-sm font-semibold text-white">Rotate (ClockWise)</p>

      {/* Value Display */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">-180°</span>
        <span className={`
          text-lg font-bold tabular-nums w-16 text-center
          ${angle > 0 ? "text-yellow-400" : angle < 0 ? "text-blue-400" : "text-gray-400"}
        `}>
          {angle > 0 ? `+${angle}°` : `${angle}°`}
        </span>
        <span className="text-xs text-gray-500">+180°</span>
      </div>

      {/* Slider */}
      <div className="relative flex items-center">
        {/* Track background gradient */}
        <div className="absolute w-full h-1.5 rounded-full bg-gradient-to-r from-gray-700 via-indigo-500 to-yellow-400 pointer-events-none" />
        <input
          type="range"
          min={-180}
          max={180}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="
            w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-transparent relative
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-indigo-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
          "
        />
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {[-180, -90, 0, +90, +180].map((preset) => (
          <button
            key={preset}
            onClick={() => setAngle(preset)}
            className={`
              flex-1 py-1 rounded-lg text-xs font-medium transition-colors
              ${angle === preset
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }
            `}
          >
            {preset > 0 ? `+${preset}` : preset}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className={`flex-1 py-2 rounded-lg text-sm ${isLoading ?"text-gray-400 bg-gray-800" : "text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors"}`}
        >
          {isLoading?"Loading...":"Reset"}
        </button>
        <button
          onClick={handleApply}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${isLoading? "text-white bg-gray-700" :"text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"}`}
        >
          {isLoading? "Loading..." : "Apply"}
        </button>
      </div>
    </div>
  )
}