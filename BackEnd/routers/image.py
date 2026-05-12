from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from PIL import Image
import numpy as np
import io
import base64
from services.pipline import apply_pipline
from schemas import ProcessRequest

router = APIRouter(
    prefix="/api/image",
    tags=["image"]
)

# end point untuk upload gambar
@router.post("/upload")
async def upload_image(file:UploadFile = File(...)):
    # validasi format file
    if file.content_type not in ["image/jpeg","image/png","image/bmp"]:
        raise HTTPException(status_code=400, detail="Format tidak didukung")
    
    # baca file ke memory -> ubah ke base64 untuk dikirim ke frontend
    contents = await file.read()
    
    # validasi bisa dibuka sebagai gambar
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
    except Exception as e:
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid")
    
    # konversi ke base64
    base64_str = base64.b64encode(contents).decode("utf-8")
    
    return {
        "image_base64" : f"data:{file.content_type};base64,{base64_str}",
        "filename" : file.filename,
        "width" : image.size[0],
        "height" : image.size[1],
        "format" : image.format
    }
    

@router.post("/process")
async def process_image(request: ProcessRequest):
    # decode base64 ke bytes
    try:
        header,encoded = request.image_base64.split(",",1)
        image_bytes = base64.b64decode(encoded)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Base64 tidak valid")
    
    # buka gambar dari btyes dan validasi
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image.verify()
        np_image = np.array(image)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Gambar tidak valid")
    
    # Apply semua operasi via pipline
    try:
        result_np = apply_pipline(np_image, request.operations)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Operasi tidak dikenali: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saat memproses gambar: {e}")
    
    result_pil = Image.fromarray(result_np.astype("uint8")) 
    buffer = io.BytesIO()
    result_pil.save(buffer, format="PNG")
    buffer.seek(0)
    
    result_base64 = base64.b64encode(buffer.read()).decode("utf-8")
    
    return JSONResponse({
        "image_base64": f"data:image/png;base64,{result_base64}"
    })
    
    
