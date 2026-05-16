import { EditorPage } from "./components/EditorPage/EditorPage";
import { UploadPage } from "./components/UploadPage/UploadPage";

function App(){
  const originalImage = useEditorStore(s=>s.originalImage);
  return originalImage ? <EditorPage/> : <UploadPage/>;
}