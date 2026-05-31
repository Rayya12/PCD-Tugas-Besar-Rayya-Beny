import numpy as np

def apply_contrast(image: np.ndarray, value: int, format: str) -> np.ndarray:
    """
    Adjust contrast of the image.
    
    Rumus:
    new_pixel = (pixel - 128) * contrast_factor + 128
    dimana contrast_factor = (259 * (value + 255)) / (255 * (259 - value))
    
    value: -255 (min) sampai +255 (max)
    """
    value = max(-255, min(255, value))
    
    contrast_factor = (259 * (value + 255)) / (255 * (259 - value))

    image = image.astype(np.int16)

    contrasted_image = (image - 128) * contrast_factor + 128

    contrasted_image = np.clip(contrasted_image, 0, 255)

    return contrasted_image.astype(np.uint8)