import useEditorStore from "../../store/editorStore";


export default function Canvas(){
    const originalImage = useEditorStore(s=>s.originalImage)
    const previewImage = useEditorStore(s=>s.previewImage);


    return (<>
        {previewImage ? (
            <div>
                <img src={previewImage} alt="Gambar Preview" />
            </div>) :<div>Halo</div>
        }
        </>
    )
}