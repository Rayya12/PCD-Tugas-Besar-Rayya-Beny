import numpy as np

def apply_edge_detection(image: np.ndarray, method: str = "sobel") -> np.ndarray:
    # Convert ke grayscale dulu (rata-rata channel RGB)
    gray = np.mean(image, axis=2)  # shape: (H, W)

    if method == "sobel":
        result = _sobel(gray)
    elif method == "prewitt":
        result = _prewitt(gray)
    elif method == "canny":
        result = _canny(gray)
    else:
        raise ValueError(f"Method tidak dikenal: {method}")

    # Convert hasil (H, W) → (H, W, 3) agar konsisten dengan pipeline
    result_3ch = np.stack([result, result, result], axis=2)
    return result_3ch.astype(np.uint8)


# ──────────────────────────────────────────────
# Helper: Konvolusi Manual
# ──────────────────────────────────────────────

def _convolve2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """Konvolusi 2D manual tanpa library eksternal."""
    H, W = image.shape
    kH, kW = kernel.shape
    padH, padW = kH // 2, kW // 2

    # Zero padding
    padded = np.pad(image, ((padH, padH), (padW, padW)), mode='constant', constant_values=0)

    output = np.zeros((H, W), dtype=np.float64)
    for i in range(H):
        for j in range(W):
            region = padded[i:i+kH, j:j+kW]
            output[i, j] = np.sum(region * kernel)

    return output


# ──────────────────────────────────────────────
# Sobel
# ──────────────────────────────────────────────

def _sobel(gray: np.ndarray) -> np.ndarray:
    """
    Kernel Sobel menghitung gradien dengan memberikan bobot
    lebih besar pada piksel tengah (koefisien 2).
    """
    Kx = np.array([[-1, 0, 1],
                   [-2, 0, 2],
                   [-1, 0, 1]], dtype=np.float64)

    Ky = np.array([[-1, -2, -1],
                   [ 0,  0,  0],
                   [ 1,  2,  1]], dtype=np.float64)

    Gx = _convolve2d(gray, Kx)
    Gy = _convolve2d(gray, Ky)

    magnitude = np.sqrt(Gx**2 + Gy**2)
    return _normalize(magnitude)


# ──────────────────────────────────────────────
# Prewitt
# ──────────────────────────────────────────────

def _prewitt(gray: np.ndarray) -> np.ndarray:
    """
    Kernel Prewitt mirip Sobel tapi tanpa pembobotan tengah
    (semua koefisien bernilai 1).
    """
    Kx = np.array([[-1, 0, 1],
                   [-1, 0, 1],
                   [-1, 0, 1]], dtype=np.float64)

    Ky = np.array([[-1, -1, -1],
                   [ 0,  0,  0],
                   [ 1,  1,  1]], dtype=np.float64)

    Gx = _convolve2d(gray, Kx)
    Gy = _convolve2d(gray, Ky)

    magnitude = np.sqrt(Gx**2 + Gy**2)
    return _normalize(magnitude)


# ──────────────────────────────────────────────
# Canny
# ──────────────────────────────────────────────

def _canny(gray: np.ndarray, low_threshold: int = 50, high_threshold: int = 150) -> np.ndarray:
    """
    Canny terdiri dari 4 tahap:
    1. Gaussian blur  → kurangi noise
    2. Sobel          → hitung gradien magnitude & arah
    3. Non-maximum suppression → tipiskan tepi jadi 1 piksel
    4. Double thresholding + hysteresis → buang tepi lemah
    """
    # Step 1: Gaussian Blur (kernel 5x5)
    blurred = _gaussian_blur(gray)

    # Step 2: Gradien magnitude & arah
    Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)
    Ky = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float64)
    Gx = _convolve2d(blurred, Kx)
    Gy = _convolve2d(blurred, Ky)

    magnitude = np.sqrt(Gx**2 + Gy**2)
    angle = np.arctan2(Gy, Gx) * 180 / np.pi  # konversi ke derajat
    angle[angle < 0] += 180                    # range 0–180

    # Step 3: Non-maximum suppression
    suppressed = _non_maximum_suppression(magnitude, angle)

    # Step 4: Double thresholding + hysteresis
    result = _hysteresis(suppressed, low_threshold, high_threshold)

    return result


def _gaussian_blur(image: np.ndarray) -> np.ndarray:
    """Gaussian kernel 5x5, sigma=1."""
    kernel = np.array([
        [2,  4,  5,  4,  2],
        [4,  9, 12,  9,  4],
        [5, 12, 15, 12,  5],
        [4,  9, 12,  9,  4],
        [2,  4,  5,  4,  2]
    ], dtype=np.float64)
    kernel /= kernel.sum()  # normalize agar total bobot = 1
    return _convolve2d(image, kernel)


def _non_maximum_suppression(magnitude: np.ndarray, angle: np.ndarray) -> np.ndarray:
    """
    Untuk setiap piksel, bandingkan magnitudenya dengan 2 tetangga
    di arah gradien. Kalau bukan yang terbesar → set ke 0.
    Tujuannya: menipiskan tepi dari beberapa piksel → 1 piksel.
    """
    H, W = magnitude.shape
    output = np.zeros((H, W), dtype=np.float64)

    for i in range(1, H - 1):
        for j in range(1, W - 1):
            a = angle[i, j]

            # Tentukan tetangga berdasarkan arah gradien (4 arah: 0°,45°,90°,135°)
            if (0 <= a < 22.5) or (157.5 <= a <= 180):
                q, r = magnitude[i, j+1], magnitude[i, j-1]       # horizontal
            elif 22.5 <= a < 67.5:
                q, r = magnitude[i+1, j-1], magnitude[i-1, j+1]   # diagonal /
            elif 67.5 <= a < 112.5:
                q, r = magnitude[i+1, j], magnitude[i-1, j]       # vertikal
            else:
                q, r = magnitude[i-1, j-1], magnitude[i+1, j+1]   # diagonal \

            if magnitude[i, j] >= q and magnitude[i, j] >= r:
                output[i, j] = magnitude[i, j]

    return output


def _hysteresis(image: np.ndarray, low: int, high: int) -> np.ndarray:
    """
    Double thresholding:
    - magnitude > high  → pasti tepi (strong edge)
    - low < magnitude < high → tepi lemah, hanya disimpan kalau
                                terhubung dengan strong edge
    - magnitude < low   → bukan tepi, buang
    """
    H, W = image.shape
    output = np.zeros((H, W), dtype=np.uint8)

    strong = 255
    weak = 50

    strong_i, strong_j = np.where(image >= high)
    weak_i, weak_j = np.where((image >= low) & (image < high))

    output[strong_i, strong_j] = strong
    output[weak_i, weak_j] = weak

    # Hysteresis: weak edge yang bertetangga dengan strong edge → jadi strong
    for i in range(1, H - 1):
        for j in range(1, W - 1):
            if output[i, j] == weak:
                neighbors = output[i-1:i+2, j-1:j+2]
                if np.any(neighbors == strong):
                    output[i, j] = strong
                else:
                    output[i, j] = 0

    return output


# ──────────────────────────────────────────────
# Helper: Normalisasi ke range 0-255
# ──────────────────────────────────────────────

def _normalize(image: np.ndarray) -> np.ndarray:
    min_val, max_val = image.min(), image.max()
    if max_val == min_val:
        return np.zeros_like(image, dtype=np.uint8)
    normalized = (image - min_val) / (max_val - min_val) * 255
    return normalized.astype(np.uint8)