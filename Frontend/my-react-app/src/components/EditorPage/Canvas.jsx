import useEditorStore from "../../store/editorStore";
import { downloadImage } from "../../api/imageApi";
import {useFormat} from "../../context/FormatContext";



function ImagePanel({ src, alt, label }) {
    const { format } = useFormat();
    return (
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-5 w-full max-w-4xl">
            <p className="text-2xl font-semibold text-white mb-4 text-center">
                {label}
            </p>

            <div className="flex justify-center overflow-hidden rounded-xl bg-black">
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[500px] w-auto object-contain rounded-xl transition duration-300 hover:scale-[1.01]"
                />
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl h-[250px] w-full max-w-4xl bg-gray-900">
            <p className="text-gray-400 text-lg">{text}</p>
        </div>
    );
}

export default function Canvas() {
    const originalImage = useEditorStore((s) => s.originalImage);
    const previewImage = useEditorStore((s) => s.previewImage);
    const {format} = useFormat();

    return (
        <div className="min-h-screen w-full bg-gray-950 px-6 py-10 overflow-y-auto">
            <div className="flex flex-col items-center gap-10">
                
                {/* Original Image */}
                {originalImage ? (
                    <ImagePanel
                        src={originalImage}
                        alt="original image before transformation"
                        label="Original Image"
                    />
                ) : (
                    <EmptyState text="Belum ada gambar original" />
                )}

                {/* Preview Image */}
                {previewImage ? (
                    <ImagePanel
                        src={previewImage}
                        alt="image after transformation"
                        label="Image After Transformation"
                    />
                ) : (
                    <EmptyState text="Preview hasil edit akan muncul di sini" />
                )}
            </div>
            <div className="flex justify-center">
                <button onClick={() => previewImage && downloadImage(previewImage, `edited-image.${format.toLowerCase()}`)} className="mt-10 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-800 disabled:text-gray-400" disabled={!previewImage}>
                    Download Image
                </button>
            </div>
        </div>
    );
}