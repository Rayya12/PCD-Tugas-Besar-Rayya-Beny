import numpy as np

def apply_brightness(image, value):
    # Pastikan value berada dalam rentang -255 hingga 255
    value = max(-255, min(255, value))
    
    # Tambahkan nilai brightness ke setiap pixel
    brightened_image = image + value
    
    # Pastikan nilai pixel tetap dalam rentang 0-255
    brightened_image = np.clip(brightened_image, 0, 255).astype(np.uint8)
    
    return brightened_image
    