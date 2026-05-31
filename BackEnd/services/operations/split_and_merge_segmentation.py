import numpy as np

def split_and_merge_segmentation(
    image: np.ndarray,
    min_size: int = 8,
    homogeneity_threshold: float = 10.0,
    format: str = "PNG"
) -> tuple[np.ndarray, np.ndarray]:
    """
    Segment an image using Split-and-Merge algorithm (Quadtree-based).

    Phase 1 - Split: Recursively divide regions that are not homogeneous.
    Phase 2 - Merge: Merge adjacent regions with similar mean color.

    Parameters
    ----------
    image : np.ndarray
        Input image of shape (H, W, 3), dtype uint8.
    min_size : int
        Minimum region size (pixels). Splitting stops below this. Default is 8.
    homogeneity_threshold : float
        Max std deviation allowed within a region to be considered homogeneous.
        Lower = stricter (more splits). Default is 10.0.
    format : str
        Output format for the segmented image. Default is "PNG".

    Returns
    -------
    segmented_image : np.ndarray
        Shape (H, W, 3) — each region filled with its mean color.
    labels : np.ndarray
        Shape (H, W) — integer region ID per pixel.
    """
    H, W = image.shape[:2]
    labels = np.full((H, W), -1, dtype=np.int32)
    region_id = [0]  # mutable counter untuk rekursi

    # ------------------------------------------------------------------ #
    # PHASE 1 — SPLIT                                                      #
    # ------------------------------------------------------------------ #

    def is_homogeneous(region: np.ndarray) -> bool:
        """Cek apakah std dev semua channel di bawah threshold."""
        return float(np.std(region.reshape(-1, 3).astype(np.float64))) < homogeneity_threshold

    def split(r: int, c: int, h: int, w: int):
        """Rekursif quadtree split."""
        region = image[r:r+h, c:c+w]

        if is_homogeneous(region) or h <= min_size or w <= min_size:
            # Tandai seluruh region dengan ID ini
            labels[r:r+h, c:c+w] = region_id[0]
            region_id[0] += 1
            return

        # Bagi menjadi 4 kuadran
        h2, w2 = h // 2, w // 2
        split(r,      c,      h2,   w2)    # top-left
        split(r,      c + w2, h2,   w-w2)  # top-right
        split(r + h2, c,      h-h2, w2)    # bottom-left
        split(r + h2, c + w2, h-h2, w-w2)  # bottom-right

    split(0, 0, H, W)

    # ------------------------------------------------------------------ #
    # PHASE 2 — MERGE                                                      #
    # ------------------------------------------------------------------ #

    def get_region_mean(lid: int) -> np.ndarray:
        """Rata-rata warna piksel dalam region label lid."""
        mask = labels == lid
        return image[mask].mean(axis=0)  # shape (3,)

    def merge_regions(labels: np.ndarray) -> np.ndarray:
        """
        Iteratif: scan seluruh piksel, cek tetangga kanan & bawah.
        Jika mean warna dua region berdekatan mirip → merge (Union-Find).
        """
        num_labels = region_id[0]

        # Union-Find
        parent = list(range(num_labels))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a, b):
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[rb] = ra

        # Precompute mean per region
        means = np.zeros((num_labels, 3), dtype=np.float64)
        for lid in range(num_labels):
            mask = labels == lid
            if mask.any():
                means[lid] = image[mask].mean(axis=0)

        # Cek adjacency: tetangga kanan dan bawah
        # Horizontal neighbors
        left  = labels[:, :-1]
        right = labels[:, 1:]
        h_diff_mask = left != right
        for (a, b) in zip(left[h_diff_mask], right[h_diff_mask]):
            if np.linalg.norm(means[find(a)] - means[find(b)]) < homogeneity_threshold:
                union(a, b)

        # Vertical neighbors
        top    = labels[:-1, :]
        bottom = labels[1:, :]
        v_diff_mask = top != bottom
        for (a, b) in zip(top[v_diff_mask], bottom[v_diff_mask]):
            if np.linalg.norm(means[find(a)] - means[find(b)]) < homogeneity_threshold:
                union(a, b)

        # Remap labels ke root-nya
        merged = np.vectorize(find)(labels)
        return merged

    labels = merge_regions(labels)

    # ------------------------------------------------------------------ #
    # RECONSTRUCT — isi tiap region dengan mean warnanya                   #
    # ------------------------------------------------------------------ #
    unique_ids = np.unique(labels)
    segmented_image = np.zeros_like(image)

    for lid in unique_ids:
        mask = labels == lid
        mean_color = image[mask].mean(axis=0).astype(np.uint8)
        segmented_image[mask] = mean_color

    return segmented_image