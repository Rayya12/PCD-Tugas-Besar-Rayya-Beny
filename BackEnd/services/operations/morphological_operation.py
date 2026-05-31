import numpy as np

def apply_morphological_operation(
    image: np.ndarray,
    operation: str,
    se: list,
    origin: list = None,
    format: str = "png",
    threshold: int = None
    
) -> np.ndarray:
    se = np.array(se, dtype=np.uint8)
    origin = np.array(origin).tolist() if origin is not None else None

    is_rgb = image.ndim == 3

    if is_rgb:
        binary = rgb_to_binary(image, threshold=threshold)  # ← pass threshold
    else:
        binary = image.copy()

    if operation == "dilation":
        result = dilate(binary, se, origin)
    elif operation == "erosion":
        result = erode(binary, se, origin)
    elif operation == "opening":
        result = opening(binary, se, origin)
    elif operation == "closing":
        result = closing(binary, se, origin)
    else:
        raise ValueError(f"Operation tidak dikenal: {operation}")

    if is_rgb:
        return binary_to_rgb(result, image)
    return result


def rgb_to_binary(image: np.ndarray, threshold: int = None) -> np.ndarray:
    """
    Konversi RGB → binary.
    Jika threshold=None, gunakan Otsu's method (otomatis, lebih robust).
    """
    gray = (
        0.299 * image[:, :, 0] +
        0.587 * image[:, :, 1] +
        0.114 * image[:, :, 2]
    ).astype(np.uint8)

    if threshold is None:
        threshold = otsu_threshold(gray)   # ← otomatis

    return (gray > threshold).astype(np.uint8)


def binary_to_rgb(binary: np.ndarray, original_rgb: np.ndarray) -> np.ndarray:
    """
    Kembalikan hasil binary ke ruang warna RGB.
    - Piksel 1 → warna asli dari original_rgb
    - Piksel 0 → hitam (0, 0, 0)
    """
    output = np.zeros_like(original_rgb)
    mask = binary == 1
    output[mask] = original_rgb[mask]
    return output


def get_default_origin(se: np.ndarray) -> tuple:
    return (se.shape[0] // 2, se.shape[1] // 2)


def dilate(image: np.ndarray, se: np.ndarray, origin: tuple = None) -> np.ndarray:
    img_h, img_w = image.shape
    se_h, se_w = se.shape

    if origin is None:
        origin = get_default_origin(se)
    or_i, or_j = origin

    output = np.zeros_like(image)

    for i in range(img_h):
        for j in range(img_w):
            if image[i, j] == 1:
                for si in range(se_h):
                    for sj in range(se_w):
                        if se[si, sj] == 1:
                            ni = i + (si - or_i)
                            nj = j + (sj - or_j)
                            if 0 <= ni < img_h and 0 <= nj < img_w:
                                output[ni, nj] = 1
    return output


def erode(image: np.ndarray, se: np.ndarray, origin: tuple = None) -> np.ndarray:
    img_h, img_w = image.shape
    se_h, se_w = se.shape

    if origin is None:
        origin = get_default_origin(se)
    or_i, or_j = origin

    output = np.zeros_like(image)

    for i in range(img_h):
        for j in range(img_w):
            fit = True
            for si in range(se_h):
                for sj in range(se_w):
                    if se[si, sj] == 1:
                        ni = i + (si - or_i)
                        nj = j + (sj - or_j)
                        if not (0 <= ni < img_h and 0 <= nj < img_w) or image[ni, nj] == 0:
                            fit = False
                            break
                if not fit:
                    break
            output[i, j] = 1 if fit else 0

    return output


def opening(image: np.ndarray, se: np.ndarray, origin: tuple = None) -> np.ndarray:
    return dilate(erode(image, se, origin), se, origin)


def closing(image: np.ndarray, se: np.ndarray, origin: tuple = None) -> np.ndarray:
    return erode(dilate(image, se, origin), se, origin)