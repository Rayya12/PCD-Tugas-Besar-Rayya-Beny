import numpy as np

def apply_smoothing(image: np.ndarray, type: str, format: str, kernel_size: int = 3) -> np.ndarray:
    """
    Apply smoothing filter to image (grayscale or RGB).
    
    type        : "mean" atau "median"
    kernel_size : ukuran kernel (default 3 → 3x3). Harus ganjil.
    format      : "png", "jpg", dll (tidak dipakai di proses, hanya metadata)
    """
    if kernel_size % 2 == 0:
        raise ValueError("kernel_size harus ganjil (3, 5, 7, ...)")

    is_rgb = image.ndim == 3

    if type == "mean":
        fn = mean_filter
    elif type == "median":
        fn = median_filter
    else:
        raise ValueError(f"Type tidak dikenal: {type}. Gunakan 'mean' atau 'median'.")

    if is_rgb:
        # Proses tiap channel secara terpisah
        channels = [fn(image[:, :, c], kernel_size) for c in range(image.shape[2])]
        return np.stack(channels, axis=2)
    else:
        return fn(image, kernel_size)


def _pad(image: np.ndarray, pad: int) -> np.ndarray:
    """Zero-padding untuk handle border."""
    return np.pad(image, pad_width=pad, mode="edge")


def mean_filter(image: np.ndarray, kernel_size: int = 3) -> np.ndarray:
    """
    Mean filter: setiap piksel diganti rata-rata tetangganya.
    """
    pad = kernel_size // 2
    padded = _pad(image, pad)
    output = np.zeros_like(image, dtype=np.float64)
    img_h, img_w = image.shape

    for i in range(img_h):
        for j in range(img_w):
            region = padded[i:i + kernel_size, j:j + kernel_size]
            output[i, j] = np.mean(region)

    return np.clip(output, 0, 255).astype(np.uint8)


def median_filter(image: np.ndarray, kernel_size: int = 3) -> np.ndarray:
    """
    Median filter: setiap piksel diganti median tetangganya.
    Efektif untuk salt-and-pepper noise.
    """
    pad = kernel_size // 2
    padded = _pad(image, pad)
    output = np.zeros_like(image, dtype=np.float64)
    img_h, img_w = image.shape

    for i in range(img_h):
        for j in range(img_w):
            region = padded[i:i + kernel_size, j:j + kernel_size]
            output[i, j] = np.median(region)

    return np.clip(output, 0, 255).astype(np.uint8)