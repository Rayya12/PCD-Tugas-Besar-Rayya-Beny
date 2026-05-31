import numpy as np

def apply_convolution(image:np.ndarray, kernel:np.ndarray,factor: float,format:str) -> np.ndarray:
    """
    Apply convolution to the image using the given kernel.
    
    image: 2D or 3D numpy array (grayscale or color)
    kernel: 2D numpy array (convolution kernel)
    factor: scaling factor for the convolved image
    
    Returns the convolved image.
    """
    kernel = np.array(kernel)
    if kernel.ndim != 2:
        raise ValueError("Kernel harus berupa matriks 2D")
    
    if len(image.shape) == 2:  # Grayscale
        return convolve2d(image, kernel, factor)
    elif len(image.shape) == 3:  # Color
        channels = []
        for i in range(image.shape[2]):
            convolved_channel = convolve2d(image[:,:,i], kernel, factor)
            channels.append(convolved_channel)
        return np.stack(channels, axis=2)
    else:
        raise ValueError("Unsupported image shape")
    
def convolve2d(image: np.ndarray, kernel: np.ndarray, factor: float) -> np.ndarray:
    image = image.astype(np.float32)
    kernel = kernel.astype(np.float32)

    kernel = np.flipud(np.fliplr(kernel))

    H, W = image.shape
    kH, kW = kernel.shape
    padH, padW = kH // 2, kW // 2

    padded_image = np.pad(
        image,
        ((padH, padH), (padW, padW)),
        mode='reflect'
    )

    output = np.zeros((H, W), dtype=np.float32)

    for i in range(H):
        for j in range(W):
            region = padded_image[i:i+kH, j:j+kW]
            output[i, j] = np.sum(region * kernel) / factor
            
    # Clip values to [0, 255] dan konversi ke uint8
    output = np.clip(output, 0, 255)
    output = output.astype(np.uint8)
    print(output)

    return output