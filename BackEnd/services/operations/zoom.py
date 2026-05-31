import numpy as np
from PIL import Image

def apply_zoom(image: np.ndarray, point: tuple, scale: float,isCenter:bool=False, format: str = "PNG") -> np.ndarray:
    """
    Zoom gambar ke arah suatu titik tertentu.

    Args:
        image (np.ndarray): Gambar dalam format numpy array (H, W, C) atau (H, W)
        point (tuple): Titik acuan zoom dalam format (x, y) / (col, row)
        scale (float): Faktor zoom. >1 = zoom in, <1 = zoom out

    Returns:
        np.ndarray: Gambar hasil zoom dengan ukuran sama dengan input
    """
    h, w = image.shape[:2]
    px, py = point  # anchor point (x=col, y=row)
    
    if isCenter:
        # Jika titik acuan adalah center, hitung offset agar tetap di tengah
        offset_x = (w / 2 - px) * (1 - 1/scale)
        offset_y = (h / 2 - py) * (1 - 1/scale)
        px += offset_x
        py += offset_y
    
    # Buat grid koordinat output
    out_cols = np.arange(w, dtype=np.float32)
    out_rows = np.arange(h, dtype=np.float32)
    cols, rows = np.meshgrid(out_cols, out_rows)

    # Inverse mapping: cari koordinat sumber untuk setiap piksel output
    # new = (src - point) * scale + point
    # → src = (new - point) / scale + point
    src_cols = (cols - px) / scale + px
    src_rows = (rows - py) / scale + py

    # Clamp agar tidak keluar batas gambar
    src_cols = np.clip(src_cols, 0, w - 1)
    src_rows = np.clip(src_rows, 0, h - 1)

    # Konversi ke integer untuk nearest-neighbor sampling
    src_cols_int = src_cols.astype(np.int32)
    src_rows_int = src_rows.astype(np.int32)

    # Sampling piksel
    return image[src_rows_int, src_cols_int]