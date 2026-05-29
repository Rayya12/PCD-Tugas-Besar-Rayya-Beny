import useEditorStore from "../../store/editorStore";

function ImagePanel({ src, alt, label }) {
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
        </div>
    );
}