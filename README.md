# 🌐 Website Navigator

A full-stack web application for bulk URL navigation. Upload Excel, CSV, or Google Sheets then browse through websites one by one with keyboard support, bookmarks, history, auto-slideshow, and multi-tab mode.

---

## ✨ Features

### Core
- **File Upload** — Drag & drop `.xlsx`, `.xls`, `.csv` files; parse with `xlsx` + `papaparse`
- **Google Sheets** — Paste a public sheet link and fetch URLs automatically
- **URL Viewer** — Embedded iframe with loading spinner and graceful blocked-site handling
- **Keyboard Navigation** — `← →` arrows to navigate between URLs
- **URL Validation** — Auto-adds `https://`, removes invalid URLs, deduplicates

### Advanced
- **History Tracking** — MongoDB-stored visit history per session
- **Bookmark System** — Save & manage bookmarks in database
- **Search & Filter** — Real-time search by domain or URL
- **Auto Slideshow** — Configurable interval (3s–30s) with Play/Pause
- **Multi-Tab Mode** — Open multiple URLs in tabs inside the app
- **Dark / Light Theme** — Smooth toggle, persisted in localStorage
- **Export** — Download full URL list as `.txt`
- **Copy URL** — One-click clipboard copy
- **Favicons** — Shows site favicon for every URL

### UI/UX
- Glassmorphism panels with soft shadows
- Smooth transitions and micro-animations
- Responsive: mobile, tablet, desktop
- Progress bar for navigation position
- Toast notifications for all actions

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React + Vite                     |
| Styling     | Pure CSS with CSS Variables          |
| State       | Context API + useReducer            |
| Backend     | Node.js + Express.js                |
| Database    | MongoDB + Mongoose                  |
| File Parse  | xlsx, papaparse                     |
| Security    | helmet, express-validator, xss, rate-limiter-flexible |
| Upload      | multer (memory storage)             |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
git clone https://github.com/dibyaranajnsahoo1/Website-Navigator
cd website-navigator
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI
```

### 3. Run Development Servers

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000

---

## 📁 Folder Structure

```
website-navigator-pro/
├── client/                    
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.jsx      
│   │   │   ├── Sidebar.jsx     
│   │   │   ├── UploadPanel.jsx 
│   │   │   ├── UrlList.jsx     
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── BookmarksPanel.jsx
│   │   │   ├── MainPanel.jsx   
│   │   │   └── ToastContainer.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx  
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css          
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     
│   ├── models/
│   │   ├── History.js
│   │   └── Bookmark.js
│   ├── routes/
│   │   ├── upload.js          
│   │   ├── history.js          
│   │   └── bookmarks.js        
│   ├── middleware/
│   │   └── rateLimiter.js
│   ├── utils/
│   │   └── urlValidator.js     
│   ├── app.js
│   └── package.json
│
├── package.json                
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

### Upload
| Method | Endpoint              | Body                     | Description              |
|--------|-----------------------|--------------------------|--------------------------|
| POST   | `/api/upload/file`    | `multipart: file`        | Upload xlsx/csv          |
| POST   | `/api/upload/sheets`  | `{ link: "..." }`        | Fetch Google Sheet CSV   |

### History
| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | `/api/history`  | Get visit history  |
| POST   | `/api/history`  | Add history entry  |
| DELETE | `/api/history`  | Clear history      |

### Bookmarks
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/bookmarks`      | Get all bookmarks    |
| POST   | `/api/bookmarks`      | Add bookmark         |
| DELETE | `/api/bookmarks/:id`  | Delete bookmark      |

---

## 🔒 Security

- **Helmet** — HTTP security headers
- **Rate Limiting** — 100 req/min per IP
- **Input Validation** — express-validator on all routes
- **XSS Sanitization** — xss library on URL inputs
- **URL Validation** — Only `http`/`https`, blocks private IP ranges
- **File Validation** — MIME type + extension check on upload

---

## ⌨️ Keyboard Shortcuts

| Key       | Action              |
|-----------|---------------------|
| `→` / `↓` | Next URL            |
| `←` / `↑` | Previous URL        |

---

## 📦 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
CLIENT_URL=
```

---

## 🏗 Production Build

```bash
# Build frontend
npm run build

# Start backend (serves API)
npm start
```



---

## 📄 License

MIT © 2026 Website Navigator Pro
DIBYA RANJAN SAHOO
