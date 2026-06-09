import numpy as np


# ═══════════════════════════════════════════════════════════════════════════════
# COLOR SPACE CONVERSIONS
# ═══════════════════════════════════════════════════════════════════════════════

def rgb_to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → Grayscale menggunakan bobot luminance ITU-R BT.601.

    Parameters
    ----------
    image : np.ndarray  shape (H, W, 3), dtype uint8

    Returns
    -------
    np.ndarray  shape (H, W), dtype uint8
    """
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Input harus RGB dengan shape (H, W, 3).")

    gray = (
        0.299 * image[:, :, 0] +
        0.587 * image[:, :, 1] +
        0.114 * image[:, :, 2]
    )
    return np.clip(gray, 0, 255).astype(np.uint8)


def rgb_to_hsv(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → HSV.

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype float64
        H : [0, 360), S : [0, 1], V : [0, 1]
    """
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Input harus RGB dengan shape (H, W, 3).")

    rgb = image.astype(np.float64) / 255.0
    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]

    Cmax  = np.max(rgb, axis=2)
    Cmin  = np.min(rgb, axis=2)
    delta = Cmax - Cmin

    V = Cmax
    S = np.where(Cmax != 0, delta / Cmax, 0.0)

    H = np.zeros_like(V)

    mask_r = (Cmax == R) & (delta != 0)
    H[mask_r] = 60.0 * (((G[mask_r] - B[mask_r]) / delta[mask_r]) % 6)

    mask_g = (Cmax == G) & (delta != 0)
    H[mask_g] = 60.0 * (((B[mask_g] - R[mask_g]) / delta[mask_g]) + 2)

    mask_b = (Cmax == B) & (delta != 0)
    H[mask_b] = 60.0 * (((R[mask_b] - G[mask_b]) / delta[mask_b]) + 4)

    H = H % 360.0

    return np.stack([H, S, V], axis=2)


def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    """
    Konversi HSV → RGB untuk keperluan display.

    Parameters
    ----------
    hsv : np.ndarray  shape (H, W, 3), dtype float64
        H : [0, 360), S : [0, 1], V : [0, 1]

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype uint8
    """
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    C  = V * S                          # Chroma
    X  = C * (1 - np.abs((H / 60.0) % 2 - 1))
    m  = V - C

    R1 = np.zeros_like(H)
    G1 = np.zeros_like(H)
    B1 = np.zeros_like(H)

    # Setiap sektor 60°
    for cond, r, g, b in [
        ((H < 60),              C, X, np.zeros_like(H)),
        ((H >= 60)  & (H < 120), X, C, np.zeros_like(H)),
        ((H >= 120) & (H < 180), np.zeros_like(H), C, X),
        ((H >= 180) & (H < 240), np.zeros_like(H), X, C),
        ((H >= 240) & (H < 300), X, np.zeros_like(H), C),
        ((H >= 300),             C, np.zeros_like(H), X),
    ]:
        R1 = np.where(cond, r, R1)
        G1 = np.where(cond, g, G1)
        B1 = np.where(cond, b, B1)

    rgb = np.stack([R1 + m, G1 + m, B1 + m], axis=2)
    return np.clip(rgb * 255.0, 0, 255).astype(np.uint8)


def rgb_to_hsv_display(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → HSV lalu kembali ke RGB untuk ditampilkan dengan benar.

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype uint8
    """
    hsv = rgb_to_hsv(image)
    return hsv_to_rgb(hsv)


def rgb_to_lab(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → CIE LAB (D65 illuminant).

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype float64
        L : [0, 100], a : [-128, 127], b : [-128, 127]
    """
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Input harus RGB dengan shape (H, W, 3).")

    # Step 1: RGB → Linear RGB (gamma removal)
    # FIX: gunakan np.where agar tidak ada mutasi in-place yang fragile
    rgb = image.astype(np.float64) / 255.0
    linear = np.where(
        rgb > 0.04045,
        ((rgb + 0.055) / 1.055) ** 2.4,
        rgb / 12.92
    )

    # Step 2: Linear RGB → XYZ (D65)
    M = np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ])
    xyz = linear @ M.T  # (H, W, 3)

    # Step 3: Normalize by D65 white point
    xyz[:, :, 0] /= 0.95047
    xyz[:, :, 1] /= 1.00000
    xyz[:, :, 2] /= 1.08883

    # Step 4: XYZ → LAB (f transform)
    epsilon = 0.008856
    kappa   = 903.3

    def f(t: np.ndarray) -> np.ndarray:
        return np.where(t > epsilon, np.cbrt(t), (kappa * t + 16.0) / 116.0)

    fx, fy, fz = f(xyz[:, :, 0]), f(xyz[:, :, 1]), f(xyz[:, :, 2])

    L = 116.0 * fy - 16.0
    a = 500.0 * (fx - fy)
    b = 200.0 * (fy - fz)

    return np.stack([L, a, b], axis=2)


def lab_to_display(lab: np.ndarray) -> np.ndarray:
    """
    Normalize LAB → uint8 RGB untuk keperluan display.
    L [0,100] → channel R
    a [-128,127] → channel G  (di-shift ke [0,255])
    b [-128,127] → channel B  (di-shift ke [0,255])

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype uint8
    """
    L_norm = np.clip(lab[:, :, 0] / 100.0 * 255.0,   0, 255)
    a_norm = np.clip((lab[:, :, 1] + 128.0),           0, 255)
    b_norm = np.clip((lab[:, :, 2] + 128.0),           0, 255)

    return np.stack([L_norm, a_norm, b_norm], axis=2).astype(np.uint8)


def rgb_to_lab_display(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → LAB lalu normalize ke RGB uint8 untuk ditampilkan.

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype uint8
    """
    lab = rgb_to_lab(image)
    return lab_to_display(lab)


def rgb_to_ycbcr(image: np.ndarray) -> np.ndarray:
    """
    Konversi RGB → YCbCr (BT.601, full range).

    Returns
    -------
    np.ndarray  shape (H, W, 3), dtype uint8
    """
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Input harus RGB dengan shape (H, W, 3).")

    R = image[:, :, 0].astype(np.float64)
    G = image[:, :, 1].astype(np.float64)
    B = image[:, :, 2].astype(np.float64)

    Y  =  16.0 + (65.481 * R + 128.553 * G + 24.966 * B) / 255.0
    Cb = 128.0 + (-37.797 * R - 74.203 * G + 112.000 * B) / 255.0
    Cr = 128.0 + (112.000 * R - 93.786 * G - 18.214 * B) / 255.0

    return np.clip(np.stack([Y, Cb, Cr], axis=2), 0, 255).astype(np.uint8)


def invert(image: np.ndarray) -> np.ndarray:
    """
    Invert (negative) image: I_out = 255 - I_in.
    """
    if image.dtype != np.uint8:
        image = np.clip(image, 0, 255).astype(np.uint8)
    return (255 - image).astype(np.uint8)


# ═══════════════════════════════════════════════════════════════════════════════
# DISPATCHER
# ═══════════════════════════════════════════════════════════════════════════════

def apply_color_operation(
    image: np.ndarray,
    operation: str,
    for_display: bool = True,
    format: str = "PNG"
) -> np.ndarray:
    """
    Dispatcher untuk semua operasi warna.

    Parameters
    ----------
    image       : np.ndarray  Input image (H, W, 3) uint8
    operation   : str
        "grayscale" | "hsv" | "lab" | "ycbcr" | "invert"
    for_display : bool
        Jika True (default), HSV dan LAB dikembalikan sebagai uint8 RGB
        yang siap ditampilkan. Jika False, dikembalikan dalam format
        native float64 (untuk komputasi lanjutan).

    Returns
    -------
    np.ndarray
    """
    if for_display:
        ops = {
            "grayscale" : rgb_to_grayscale,
            "hsv"       : rgb_to_hsv_display,   # HSV → RGB uint8
            "lab"       : rgb_to_lab_display,   # LAB → normalized RGB uint8
            "ycbcr"     : rgb_to_ycbcr,
            "invert"    : invert,
        }
    else:
        ops = {
            "grayscale" : rgb_to_grayscale,
            "hsv"       : rgb_to_hsv,            # float64 native
            "lab"       : rgb_to_lab,            # float64 native
            "ycbcr"     : rgb_to_ycbcr,
            "invert"    : invert,
        }

    if operation not in ops:
        raise ValueError(
            f"Operation '{operation}' tidak dikenal. "
            f"Pilih dari: {list(ops.keys())}"
        )

    return ops[operation](image)