# services/operations/histogram_eq.py

import numpy as np

def apply_histogram_equalization(image: np.ndarray) -> np.ndarray:
    """
    Histogram Equalization meratakan distribusi intensitas piksel
    agar kontras gambar meningkat.
    
    Prosesnya:
    1. Hitung histogram (frekuensi tiap nilai intensitas 0-255)
    2. Hitung CDF (Cumulative Distribution Function)
    3. Normalisasi CDF ke range 0-255
    4. Mapping nilai piksel lama → nilai baru via CDF
    """
    # Proses tiap channel secara terpisah (R, G, B)
    result = np.zeros_like(image)
    for ch in range(3):
        result[:, :, ch] = _equalize_channel(image[:, :, ch])
    return result


def _equalize_channel(channel: np.ndarray) -> np.ndarray:
    H, W = channel.shape
    total_pixels = H * W

    # Step 1: Hitung histogram
    # histogram[i] = jumlah piksel yang punya nilai intensitas i
    histogram = np.zeros(256, dtype=np.int64)
    for val in channel.flatten():
        histogram[val] += 1

    # Step 2: Hitung CDF
    # CDF[i] = jumlah piksel dengan intensitas <= i (akumulasi)
    cdf = np.zeros(256, dtype=np.int64)
    cdf[0] = histogram[0]
    for i in range(1, 256):
        cdf[i] = cdf[i-1] + histogram[i]

    # Step 3: Normalisasi CDF → mapping table
    # Rumus: cdf_normalized[i] = round((cdf[i] - cdf_min) / (total - cdf_min) * 255)
    cdf_min = cdf[cdf > 0].min()  # nilai CDF terkecil yang bukan 0

    mapping = np.zeros(256, dtype=np.uint8)
    for i in range(256):
        if cdf[i] == 0:
            mapping[i] = 0
        else:
            mapping[i] = round((cdf[i] - cdf_min) / (total_pixels - cdf_min) * 255)

    # Step 4: Apply mapping ke setiap piksel
    result = mapping[channel]
    return result