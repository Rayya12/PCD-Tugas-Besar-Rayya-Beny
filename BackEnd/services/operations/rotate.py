import numpy as np

def apply_rotate(image: np.ndarray, angle: float, expand: bool = True) -> np.ndarray:
    """
    Rotasi gambar secara manual menggunakan inverse mapping.

    Kenapa inverse mapping?
    - Forward mapping: piksel sumber → piksel output (bisa ada lubang/gap)
    - Inverse mapping: piksel output → cari dari sumber (semua piksel output terisi)

    Prosesnya:
    1. Hitung ukuran canvas output
    2. Untuk setiap piksel output (x', y'), hitung koordinat asalnya (x, y) di sumber
    3. Ambil nilai piksel dari sumber (dengan bilinear interpolation)
    """
    angle_rad = np.deg2rad(angle)
    cos_a = np.cos(angle_rad)
    sin_a = np.sin(angle_rad)

    H, W = image.shape[:2]
    cx, cy = W / 2, H / 2  # pusat rotasi = center gambar

    # Step 1: Hitung ukuran canvas output agar gambar tidak terpotong
    if expand:
        new_W, new_H = _compute_new_size(W, H, cos_a, sin_a)
    else:
        new_W, new_H = W, H

    new_cx, new_cy = new_W / 2, new_H / 2

    # Step 2: Buat grid koordinat untuk semua piksel output sekaligus
    # coords_x[i,j] = koordinat x dari piksel output (i,j)
    out_y, out_x = np.mgrid[0:new_H, 0:new_W]  # shape: (new_H, new_W)

    # Step 3: Inverse mapping — balik rotasi untuk cari koordinat di sumber
    # Translate ke pusat → inverse rotate → translate balik
    dx = out_x - new_cx
    dy = out_y - new_cy

    src_x = cos_a * dx + sin_a * dy + cx
    src_y = -sin_a * dx + cos_a * dy + cy

    # Step 4: Bilinear interpolation
    result = _bilinear_interpolate(image, src_x, src_y)

    return result


def _compute_new_size(W: int, H: int, cos_a: float, sin_a: float):
    """
    Hitung ukuran canvas baru agar gambar yang dirotasi tidak terpotong.
    Caranya: rotasi keempat sudut gambar, ambil bounding box-nya.
    """
    corners = np.array([
        [0, 0],
        [W, 0],
        [0, H],
        [W, H]
    ], dtype=np.float64)

    cx, cy = W / 2, H / 2

    rotated = np.array([
        [ cos_a * (c[0]-cx) - sin_a * (c[1]-cy) + cx,
          sin_a * (c[0]-cx) + cos_a * (c[1]-cy) + cy ]
        for c in corners
    ])

    new_W = int(np.ceil(rotated[:, 0].max() - rotated[:, 0].min()))
    new_H = int(np.ceil(rotated[:, 1].max() - rotated[:, 1].min()))
    return new_W, new_H


def _bilinear_interpolate(image: np.ndarray, src_x: np.ndarray, src_y: np.ndarray) -> np.ndarray:
    """
    Bilinear interpolation: daripada ambil piksel terdekat (nearest neighbor
    yang hasilnya kotak-kotak/aliasing), kita interpolasi dari 4 piksel sekitar.

    Ilustrasi:
        (x0,y0) ──── (x1,y0)
           │     P        │       P = titik yang kita cari
        (x0,y1) ──── (x1,y1)

    Nilai P = rata-rata berbobot dari 4 sudut berdasarkan jarak
    """
    H, W = image.shape[:2]
    channels = image.shape[2] if image.ndim == 3 else 1

    # Koordinat integer atas-kiri
    x0 = np.floor(src_x).astype(np.int32)
    y0 = np.floor(src_y).astype(np.int32)
    x1 = x0 + 1
    y1 = y0 + 1

    # Bobot interpolasi (jarak fraksional)
    wx = src_x - x0   # bobot ke kanan
    wy = src_y - y0   # bobot ke bawah

    # Clamp koordinat agar tidak keluar batas gambar
    x0c = np.clip(x0, 0, W - 1)
    x1c = np.clip(x1, 0, W - 1)
    y0c = np.clip(y0, 0, H - 1)
    y1c = np.clip(y1, 0, H - 1)

    # Mask piksel yang benar-benar di luar gambar sumber → set ke 0 (hitam)
    valid = (src_x >= 0) & (src_x <= W - 1) & (src_y >= 0) & (src_y <= H - 1)

    result = np.zeros((*src_x.shape, channels), dtype=np.float64)

    for ch in range(channels):
        ch_img = image[:, :, ch] if image.ndim == 3 else image

        # Nilai dari 4 tetangga
        Q00 = ch_img[y0c, x0c].astype(np.float64)  # kiri atas
        Q10 = ch_img[y0c, x1c].astype(np.float64)  # kanan atas
        Q01 = ch_img[y1c, x0c].astype(np.float64)  # kiri bawah
        Q11 = ch_img[y1c, x1c].astype(np.float64)  # kanan bawah

        # Interpolasi
        interpolated = (Q00 * (1 - wx) * (1 - wy) +
                        Q10 * wx       * (1 - wy) +
                        Q01 * (1 - wx) * wy       +
                        Q11 * wx       * wy)

        result[:, :, ch] = np.where(valid, interpolated, 0)

    return np.clip(result, 0, 255).astype(np.uint8)