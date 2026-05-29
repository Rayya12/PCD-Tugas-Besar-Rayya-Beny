import useEditorStore from "../../store/editorStore";

function ImagePanel({src,alt,label}){
    return (
        <div>
                <p className="text-xl text-white font-bold text-center mb-2">{label}</p>
                <img src={src} alt={alt} />
        </div>
    )
}


export default function Canvas(){
    const originalImage = useEditorStore(s=>s.originalImage)
    const previewImage = useEditorStore(s=>s.previewImage);


    return (<div className="flex flex-col items-center bg-gray-950  justify-center space-y-8 px-6 w-full">
        {
            originalImage ? (
                <div>
                    <ImagePanel src={originalImage} alt="original image before transformation" label="Original Image"/>
                </div>
            ): <div></div>
        }

        {previewImage ? (
            <div>
                <ImagePanel src={previewImage} alt="image after transformation" label="Image After Transformation"/>
            </div>) 
            :<div>Halo</div>
        }
        </div>
    )
}