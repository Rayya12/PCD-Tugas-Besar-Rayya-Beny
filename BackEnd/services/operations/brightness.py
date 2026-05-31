import numpy as np

def apply_brightness(image, value, format:str):
    value = max(-255, min(255, value))

    # ubah dulu ke signed integer
    image = image.astype(np.int16)

    brightened_image = image + value

    brightened_image = np.clip(brightened_image, 0, 255)

    return brightened_image.astype(np.uint8)