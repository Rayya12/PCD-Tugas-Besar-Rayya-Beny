import numpy as np

def kmeans_segmentation(image:np.ndarray,k:int,max_iter:int=100,tol:float=1e-4,random_seed:int=42,format: str = "PNG") -> np.ndarray:
    """
    Segment an image using K-Means Clustering based on pixel color (RGB).

    Iteratively assigns each pixel to the nearest cluster centroid (by Euclidean
    distance in RGB space), then updates centroids as the mean of assigned pixels.
    Stops when centroids converge or max_iter is reached.

    Parameters
    ----------
    image : np.ndarray
        Input image as a NumPy array of shape (H, W, 3) with dtype uint8 (R, G, B).
    k : int
        Number of clusters (segments). Default is 3.
    max_iter : int
        Maximum number of iterations. Default is 100.
    tol : float
        Convergence tolerance — stops if centroid shift is below this value. Default is 1e-4.
    random_seed : int
        Seed for reproducible centroid initialization. Default is 42.

    Returns
    -------
    segmented_image : np.ndarray
        Image of shape (H, W, 3) where each pixel is replaced by its cluster's
        centroid color (uint8).
    labels : np.ndarray
        2D array of shape (H, W) with integer cluster assignments [0, k-1].

    Example
    -------
    >>> img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    >>> segmented, labels = kmeans_segmentation(img, k=4)
    """
    
    H,W,C = image.shape
    pixels = image.reshape(-1,C).astype(np.float64)
    N = pixels.shape[0]
    
    # --- Initialize centroids by random pixel sampling (K-Means++) style ---
    rng = np.random.default_rng(random_seed)
    indices = rng.choice(N,size=k,replace=False)
    centroids = pixels[indices].copy()
    
    labels = np.zeros(N,dtype=np.int32)
    for iteration in range(max_iter):
        # --- Assignment step: assign each pixel to nearest centroid ---
        # Compute squared Euclidean distances: (N, k)
        diff = pixels[:,np.newaxis,:] - centroids[np.newaxis,:,:] # (N, k, 3)
        distances = np.sum(diff ** 2, axis=2)  # (N, k)
        new_labels = np.argmin(distances, axis=1)  # (N,)
        
        # --- Update step: recompute centroids ---
        new_centroids = np.zeros_like(centroids)
        for j in range(k):
            mask = new_labels == j
            if mask.sum() > 0:
                new_centroids[j] = pixels[mask].mean(axis=0)
            else:
                # Handle empty cluster: reinitialize to a random pixel
                new_centroids[j] = pixels[rng.integers(0, N)]
        
        # --- Convergence check ---
        centroid_shift = np.linalg.norm(new_centroids - centroids)
        centroids = new_centroids
        labels = new_labels
        
        if centroid_shift < tol:
            print(f"[K-Means] Converged at iteration {iteration + 1} (shift={centroid_shift:.6f})")
            break
    else:
        print(f"[K-Means] Reached max_iter={max_iter} without full convergence.")
        
    # --- Reconstruct segmented image using centroid colors ---
    segmented_pixels = centroids[labels]  # (N, 3)
    segmented_image = np.clip(segmented_pixels, 0, 255).astype(np.uint8).reshape(H, W, C)
    labels_2d = labels.reshape(H, W)

    return segmented_image