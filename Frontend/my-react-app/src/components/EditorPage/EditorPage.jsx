import SideBar from "./SideBar"
import Canvas from "./Canvas"
import {FormatProvider} from "../../context/FormatContext"

export function EditorPage(){
    return (

        <FormatProvider>
            <div className="flex h-screen">
                <div className="sticky top-0 h-screen self-start shrink-0">
                    <SideBar/>
                </div>
                <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    <Canvas/>
                </div>
            </div>
        </FormatProvider>
    )
}