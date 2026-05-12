# services/operations/histogram_spec.py

import numpy as np

def apply_histogram_specification(image: np.ndarray, target_hist: list[int]) -> np.ndarray:
    """
    Histogram Specification (Histogram Matching) — menyesuaikan distribusi
    intensitas gambar sumber agar mendekati distribusi target yang diinginkan.

    Bedanya dengan Histogram Equalization:
    - Equalization → target selalu distribusi MERATA (uniform)
    - Specification → target bisa distribusi APA SAJA (sesuai keinginan)

    Prosesnya:
    1. Hitung CDF gambar sumber
    2. Hitung CDF target (dari target_hist yang dikirim frontend)
    3. Untuk tiap nilai intensitas sumber, cari nilai target yang CDF-nya paling dekat
    4. Gunakan mapping tersebut untuk transform piksel
    """
    if len(target_hist) != 256:
        raise ValueError("target_hist harus memiliki tepat 256 nilai")

    target_hist_np = np.array(target_hist, dtype=np.float64)

    result = np.zeros_like(image)
    for ch in range(3):
        result[:, :, ch] = _specify_channel(image[:, :, ch], target_hist_np)
    return result


def _specify_channel(channel: np.ndarray, target_hist: np.ndarray) -> np.ndarray:
    H, W = channel.shape
    total_pixels = H * W

    # Step 1: Hitung histogram & CDF sumber
    src_histogram = np.zeros(256, dtype=np.int64)
    for val in channel.flatten():
        src_histogram[val] += 1

    src_cdf = np.zeros(256, dtype=np.float64)
    src_cdf[0] = src_histogram[0]
    for i in range(1, 256):
        src_cdf[i] = src_cdf[i-1] + src_histogram[i]

    # Normalisasi CDF sumber ke range 0-1
    src_cdf_norm = src_cdf / total_pixels

    # Step 2: Hitung CDF target & normalisasi ke range 0-1
    target_total = target_hist.sum()
    if target_total == 0:
        raise ValueError("target_hist tidak boleh semua nol")

    target_cdf = np.zeros(256, dtype=np.float64)
    target_cdf[0] = target_hist[0]
    for i in range(1, 256):
        target_cdf[i] = target_cdf[i-1] + target_hist[i]

    target_cdf_norm = target_cdf / target_total

    # Step 3: Buat mapping sumber → target
    # Untuk setiap nilai intensitas i (0-255) di sumber,
    # cari nilai j di target yang CDF-nya paling dekat dengan CDF sumber[i]
    #
    # src_cdf_norm[i] ──► cari j dimana target_cdf_norm[j] paling dekat
    #
    mapping = np.zeros(256, dtype=np.uint8)
    for i in range(256):
        # Hitung selisih CDF sumber[i] dengan semua nilai CDF target
        diff = np.abs(target_cdf_norm - src_cdf_norm[i])
        # Ambil index (nilai intensitas target) yang selisihnya paling kecil
        mapping[i] = np.argmin(diff)

    # Step 4: Apply mapping ke channel
    result = mapping[channel]
    return result