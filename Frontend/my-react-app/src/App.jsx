import { EditorPage } from "./components/EditorPage/EditorPage";
import UploadPage from "./components/UploadPage/UploadPage";
import { useEditorStore } from "./store/editorStore";

function App(){
  const originalImage = useEditorStore(s=>s.originalImage);

  return originalImage ? <EditorPage/> : <UploadPage/>;
}

export default App