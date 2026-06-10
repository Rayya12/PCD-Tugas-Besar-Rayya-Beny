# 🖼 Rabensop — Web-Based Image Editor

Rabensop adalah aplikasi web image editor sederhana berbasis **React + FastAPI** yang memungkinkan pengguna melakukan berbagai operasi pengolahan citra secara interaktif. Seluruh algoritma diimplementasikan secara manual menggunakan **NumPy** dan **OpenCV** tanpa bergantung pada library pemrosesan gambar tingkat tinggi.

---

## ✨ Fitur

### Basic
- **Brightness & Contrast** — penyesuaian kecerahan dan kontras gambar
- **Grayscale** — konversi gambar ke skala abu-abu menggunakan luminance formula
- **Invert / Negative** — membalik nilai intensitas piksel

### Transform
- **Rotate** — rotasi gambar dengan inverse mapping + bilinear interpolation
- **Flip** — membalik gambar secara horizontal maupun vertikal
- **Zoom** — memperbesar/memperkecil gambar

### Histogram
- **Histogram Equalization** — meratakan distribusi intensitas secara otomatis
- **Histogram Specification** — menyesuaikan distribusi intensitas ke target tertentu (Gaussian, Uniform, Rayleigh)

### Filter
- **Gaussian Blur** — menghaluskan gambar untuk mengurangi noise
- **Mean Filter** — rata-rata piksel sekitar
- **Median Filter** — mengurangi salt & pepper noise

### Edge Detection
- **Sobel** — deteksi tepi dengan pembobotan gradien
- **Prewitt** — deteksi tepi tanpa pembobotan
- **Canny** — deteksi tepi multi-step (blur → gradien → NMS → hysteresis)

### Morphology
- **Dilasi & Erosi**
- **Opening & Closing**

### Segmentation
- **K-Means Clustering** — segmentasi berbasis warna ke K cluster
- **Split and Merge** -- Segmentasi dengan cara split dan merge menggunakan treshold tertentu

### Analisis Visual
- **Histogram RGB / Luminance** — ditampilkan untuk gambar original dan hasil edit
- **HSV Analysis** — distribusi Hue, Saturation, dan Value dari gambar original

### Color Opertaion
- **RGB->LAB,YBCR,HSV** Melihat gambar apabila dalam format tertentu

### Convolution
- **3x3 Kernel Convolution** Konvolusi menggunakan kernel 3x3 

---

## 🏗 Arsitektur

Berikut alur pemrosesan pada applikasi Rabensop

```
Frontend (React + Vite + Tailwind)
        │  HTTP (JSON + base64)
        ▼
Backend (FastAPI + Python)
        │
        ▼
Operation Pipeline
  └── brightness → rotate → edge_detection → ... (stacked operations)
```

---

## 🛠 Tech Stack

| Layer     | Teknologi                              |
|-----------|----------------------------------------|
| Frontend  | React, Vite, Tailwind CSS, Zustand     |
| Backend   | FastAPI, Uvicorn, Python 3.12+         |
| Image     | NumPy, OpenCV (headless), Pillow       |
| Testing   | Pytest, pytest-asyncio                 |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Python 3.12+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (Python package manager)

---

### Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
uv sync

# Jalankan server
uv run uvicorn main:app --reload
```

Server berjalan di `http://localhost:8000`
Swagger docs tersedia di `http://localhost:8000/docs`

---

### Frontend

```bash
# Masuk ke folder frontend
cd frontend/my-react-app

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`

---

## 📁 Struktur Project

```
Rabensop/
├── backend/
│   ├── main.py                  # Entry point FastAPI
│   ├── schemas.py               # Pydantic models
│   ├── routers/
│   │   └── image.py             # API endpoints (/upload, /process)
│   └── services/
|       ├── operations/ 
│       └── pipeline.py          # Operation stack executor
│
└── frontend/my-react-app/
    └── src/
        ├── api/
        │   └── imageApi.js      # HTTP client ke backend
        ├── store/
        │   └── editorStore.js   # Zustand global state
        ├── context/
        │   └── FormatContext.jsx
        └── components/
            ├── UploadPage/
            ├── EditorPage/
                ├── Canvas.jsx
                ├── LeftPanel.jsx
                └── OperationPanel/
        
```

---

## 👥 Authors

| Nama | Role |
|------|------|
| Rayya Syauqi Alulu'i | Developer |
| Jehezkiel Beny Brian | Developer |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan akademik — Tugas Besar mata kuliah **Pengolahan Citra Digital (PCD)**, Telkom University.
