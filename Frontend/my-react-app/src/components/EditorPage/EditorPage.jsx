import SideBar from "./SideBar"
import Canvas from "./Canvas"

export function EditorPage(){
    return (
        <div className="flex h-screen">
            <div className="sticky top-0 h-screen self-start shrink-0">
                <SideBar/>
            </div>
            <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <Canvas/>
            </div>
        </div>
    )
}