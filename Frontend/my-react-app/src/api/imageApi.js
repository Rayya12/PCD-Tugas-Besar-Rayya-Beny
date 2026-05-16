// nanti ubah menggunakan .env
const BASE_URL = "http://localhost:8000/api/image";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file",file);

    const response = await fetch(`${BASE_URL}/upload`,{
        method : "POST",
        body: formData
    });

    if (!response.ok){
        const error = await response.json();
        throw new Error(error.detail || "Gagal Upload Gambar")
    }

    const data= await response.json();
    return data;

}


export const processImage = async (imageBase64,operations) => {
    const response = await fetch(`${BASE_URL}/process`,
        {
            method : "POST",
            headers: {"Content-Type" : "application/json"},
            body : JSON.stringify({
                image_base64 : imageBase64,
                operations : operations
            })
        }
    );

    if (!response.ok){
        const error = await response.json();
        throw new Error(error.detail || "Gagal memproses gambar");
    }

    const data = await response.json();
    return data.image_base64;
}

export const downloadImage = (imageBase64,filename="result.png")=> {
    const link = document.createElement("a");
    link.href = imageBase64;
    link.download = filename;
    link.click();
}