import numpy as np

def apply_convolution(image:np.ndarray, kernel:np.ndarray) -> np.ndarray:
    """
    Apply convolution to the image using the given kernel.
    
    image: 2D or 3D numpy array (grayscale or color)
    kernel: 2D numpy array (convolution kernel)
    
    Returns the convolved image.
    """
    kernel = np.array(kernel)
    if kernel.ndim != 2:
        raise ValueError("Kernel harus berupa matriks 2D")
    
    if len(image.shape) == 2:  # Grayscale
        return convolve2d(image, kernel)
    elif len(image.shape) == 3:  # Color
        channels = []
        for i in range(image.shape[2]):
            convolved_channel = convolve2d(image[:,:,i], kernel)
            channels.append(convolved_channel)
        return np.stack(channels, axis=2)
    else:
        raise ValueError("Unsupported image shape")
    
def convolve2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """Convolve a 2D image with a 2D kernel."""
    H, W = image.shape
    kH, kW = kernel.shape
    padH, padW = kH // 2, kW // 2

    # Pad the image with zeros on the borders
    padded_image = np.pad(image, ((padH, padH), (padW, padW)), mode='constant', constant_values=0)

    output = np.zeros_like(image)
    for i in range(H):
        for j in range(W):
            region = padded_image[i:i+kH, j:j+kW]
            output[i, j] = np.sum(region * kernel)

    return output