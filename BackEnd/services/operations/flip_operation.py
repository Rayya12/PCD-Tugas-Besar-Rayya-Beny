import numpy as np
def apply_flip(image: np.ndarray, mode: str) -> np.ndarray:
    """
    Flip the image horizontally or vertically.
    
    mode: "horizontal" atau "vertical"
    """
    if mode == "horizontal":
        return np.fliplr(image)
    elif mode == "vertical":
        return np.flipud(image)
    else:
        raise ValueError(f"Mode tidak dikenal: {mode}")