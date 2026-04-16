<<<<<<< HEAD
# PDFLynx — Production-Ready PDFLynxcessing Platform

A complete, full-stack PDF toolkit web application inspired by ilovepdf.com. Built with **React 18 + Vite + TailwindCSS** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local or Docker)
- **Windows**: Visual Studio Build Tools (for `canvas` native module) — [Download here](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### 1. Backend Setup

```bash
cd server
copy .env.example .env   # Edit .env to set your MONGO_URI and JWT_SECRET
npm install
npm run dev              # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev              # Starts on http://localhost:5173
```

---

## 🐳 Docker (Recommended)

```bash
# From project root:
docker-compose up --build -d

# Server: http://localhost:5000
# MongoDB: localhost:27017
```

To also serve the frontend via Docker, build it first:
```bash
cd client && npm run build
```
Then serve the `dist/` folder from Nginx or any static host.

---

## 📋 Environment Variables (server/.env)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/pdflynx` | MongoDB connection string |
| `JWT_SECRET` | — | **Change this!** Long random string |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `FILE_TTL_MINUTES` | `30` | Auto-delete files after N minutes |
| `MAX_FILE_SIZE_MB` | `50` | Max upload size |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |

---

## 🔧 PDF Tools

| Tool | Endpoint | Library |
|---|---|---|
| Merge PDF | `POST /api/pdf/merge` | pdf-lib |
| Split PDF | `POST /api/pdf/split` | pdf-lib |
| Compress PDF | `POST /api/pdf/compress` | pdf-lib |
| Rotate PDF | `POST /api/pdf/rotate` | pdf-lib |
| Add Watermark | `POST /api/pdf/watermark` | pdf-lib |
| Protect PDF | `POST /api/pdf/protect` | pdf-lib |
| Unlock PDF | `POST /api/pdf/unlock` | pdf-lib |
| Add Page Numbers | `POST /api/pdf/page-numbers` | pdf-lib |
| PDF → Word | `POST /api/pdf/convert` | pdf-parse + docx |
| PDF → JPG | `POST /api/pdf/convert` | pdfjs-dist + canvas |
| JPG → PDF | `POST /api/pdf/convert` | pdf-lib |
| OCR | `POST /api/pdf/ocr` | tesseract.js |

---

## 🔐 Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, get JWT |
| `GET` | `/api/auth/profile` | Get profile (auth) |
| `PUT` | `/api/auth/profile` | Update profile (auth) |

---

## 📁 Project Structure

```
NEW PDFLynx/
├── server/              # Node.js + Express backend (MVC)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/        # Core PDFLynxcessing logic
│   ├── utils/
│   ├── uploads/         # Temp input files (auto-cleaned)
│   ├── outputs/         # Processed outputs (auto-cleaned)
│   └── server.js
│
├── client/              # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── tools/   # One page per PDF tool
│   │   ├── services/    # axios API client
│   │   └── store/       # Zustand auth store
│   └── public/
│
└── docker-compose.yml
```

---

## ⚠️ Windows-specific: Canvas Installation

The `canvas` package (for PDF→JPG) requires native build tools on Windows.

**Option A — Install build tools:**
1. Install [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with "Desktop development with C++"
2. Install [Python 3.x](https://www.python.org/downloads/)
3. Run: `npm install` in the server directory

**Option B — Skip canvas (PDF→JPG disabled):**
The server gracefully handles the case where `canvas` is unavailable. All other tools still work.

---

## 🔒 Security Features

- JWT authentication with bcrypt password hashing
- Rate limiting: 100 req/15min general, 10 auth/15min, 30 PDF ops/hour
- Helmet.js security headers
- File auto-deletion after 30 minutes (configurable)
- File type validation (PDF and images only)
- Max file size enforcement (50MB default)
- CORS configured to specific origins

---

## 🚀 Deployment

### Backend (DigitalOcean / EC2)
```bash
docker-compose up -d
```

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel/Netlify
# Set VITE_API_URL env var to your backend URL
```

---

## 📈 Scaling

- **Queue system**: Add BullMQ + Redis for async PDFLynxcessing
- **Storage**: Swap `fileHelper.js` for AWS S3 (single file change)
- **CDN**: Put Cloudflare in front for file delivery
- **Microservices**: Split heavy tools (OCR, PDF→JPG) into separate worker services
=======
# PDFLynx.com_New
PDFLynx.com_New
>>>>>>> f37b1103adc76be311aca57eb6257d8c72e76c90
