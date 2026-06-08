# ⚛️ SmartPhysics — Interactive Multimedia Learning System

> **"Belajar Fisika Lebih Interaktif dan Menyenangkan"**

Platform pembelajaran fisika multimedia berbasis React + Express.js + MongoDB untuk jenjang SMP, SMA, dan mahasiswa dasar. Materi utama: **Hukum Newton dan Gerak**.

---

## 🗂 Struktur Proyek

```
smartphysics/
├── frontend/                   # React App (Vite + Framer Motion)
│   ├── src/
│   │   ├── App.jsx             # Root component + routing
│   │   ├── index.css           # Global styles (dark/light, glassmorphism)
│   │   ├── main.jsx            # React DOM entry
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigasi + progress bar + dark mode
│   │   │   └── ParticleBackground.jsx   # Canvas particle effect
│   │   └── pages/
│   │       ├── Home.jsx        # Hero, orbit animation, feature cards
│   │       ├── Pendahuluan.jsx # Pengertian, tujuan, alur belajar
│   │       ├── Materi.jsx      # Newton I/II/III + animasi + audio
│   │       ├── Simulasi.jsx    # 3 simulasi interaktif realtime
│   │       ├── Evaluasi.jsx    # Quiz 10 soal + timer + skor
│   │       ├── Hasil.jsx       # Leaderboard + grafik + badge
│   │       └── Info.jsx        # Developer, tech stack, referensi
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                    # Express.js API
    ├── server.js               # Entry point + MongoDB connect
    ├── models/
    │   ├── QuizResult.js       # Schema: name, score, topic, timeUsed
    │   └── Progress.js         # Schema: progress per sesi
    ├── routes/
    │   ├── quiz.js             # CRUD + leaderboard + stats
    │   └── progress.js         # Track halaman selesai
    ├── scripts/
    │   └── seed.js             # Isi database dengan data demo
    ├── .env.example            # Template environment variables
    └── package.json
```

---

## 🚀 Cara Menjalankan

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local) atau **MongoDB Atlas** (cloud)
- **npm** atau **yarn**

---

### 1️⃣ Clone / Download Proyek

```bash
# Jika dari Git:
git clone https://github.com/kamu/smartphysics.git
cd smartphysics

# Atau ekstrak ZIP yang didownload
```

---

### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env sesuai kebutuhan (MONGO_URI, PORT)
# Jika pakai MongoDB lokal:
#   MONGO_URI=mongodb://127.0.0.1:27017/smartphysics
# Jika pakai Atlas:
#   MONGO_URI=mongodb+srv://user:pass@cluster.xxx.mongodb.net/smartphysics

# (Opsional) Isi database dengan data demo
node scripts/seed.js

# Jalankan server
npm run dev        # Development (nodemon - auto restart)
# atau
npm start          # Production
```

✅ Backend berjalan di: `http://localhost:8000`

---

### 3️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

✅ Frontend berjalan di: `http://localhost:3000`

---

## 📡 API Endpoints

| Method   | Endpoint                   | Deskripsi              |
| -------- | -------------------------- | ---------------------- |
| `GET`    | `/api/health`              | Cek status server & DB |
| `POST`   | `/api/quiz`                | Simpan hasil quiz      |
| `GET`    | `/api/quiz/leaderboard`    | Top 20 skor tertinggi  |
| `GET`    | `/api/quiz/stats`          | Statistik keseluruhan  |
| `GET`    | `/api/quiz/recent`         | 10 hasil terbaru       |
| `GET`    | `/api/quiz`                | Semua data (paginasi)  |
| `DELETE` | `/api/quiz/:id`            | Hapus satu hasil       |
| `GET`    | `/api/progress/:sessionId` | Ambil progress user    |
| `PATCH`  | `/api/progress/:sessionId` | Update progress        |

### Contoh Request — Simpan Hasil Quiz

```json
POST /api/quiz
Content-Type: application/json

{
  "name":     "Pasha",
  "score":    90,
  "topic":    "Hukum Newton",
  "timeUsed": 312,
  "answers":  [1, 1, 2, 2, 1, 1, 1, 0, 1, 1]
}
```

### Contoh Response — Leaderboard

```json
{
  "success": true,
  "count": 10,
  "data": [
    { "name": "Pasha", "score": 100, "grade": "A", "timeUsed": 312 },
    { "name": "Fitriani", "score": 100, "grade": "A", "timeUsed": 290 }
  ]
}
```

---

## 🗄️ MongoDB Schema

```javascript
// Collection: quizresults
{
  name:         String,   // "Pasha"
  score:        Number,   // 90  (0-100)
  topic:        String,   // "Hukum Newton"
  timeUsed:     Number,   // detik: 312
  answers:      [Number], // [1, 1, 2, 2, 1, 1, 1, 0, 1, 1]
  grade:        String,   // "A" (otomatis dari score)
  correctCount: Number,   // 9
  createdAt:    Date,
  updatedAt:    Date
}
```

---

## 🎯 Fitur Lengkap

### 7 Halaman MPI

| #   | Halaman         | Fitur Utama                                                             |
| --- | --------------- | ----------------------------------------------------------------------- |
| 1   | **Home**        | Hero animasi orbit SVG, particle background, feature cards              |
| 2   | **Pendahuluan** | Tujuan belajar, timeline alur, manfaat platform                         |
| 3   | **Materi**      | Newton I/II/III, animasi Framer Motion, audio narasi toggle, tab konten |
| 4   | **Simulasi**    | 3 mode simulasi fisika realtime + v-t graph                             |
| 5   | **Evaluasi**    | 10 soal quiz, timer countdown, skor otomatis, penjelasan per soal       |
| 6   | **Hasil**       | Leaderboard, grafik progress, badge pencapaian, analisis kelas          |
| 7   | **Info**        | Developer profile, arsitektur SVG, tech stack, referensi                |

### Simulasi Interaktif (3 Mode)

- **Newton II** — Slider gaya & massa → benda bergerak + v-t graph realtime
- **Gerak Parabola** — Slider v₀ & sudut → lintasan parabola animasi
- **Newton III** — Slider gaya & dua massa → visualisasi aksi-reaksi

### Fitur Tambahan

- 🌙 Dark mode / ☀️ Light mode (CSS Variables)
- ✨ Particle background Canvas (simbol fisika mengambang)
- 📊 Progress tracker per halaman di Navbar
- 🏆 Leaderboard real dari MongoDB
- 📈 Grafik distribusi nilai + riwayat skor SVG
- 🏅 Badge pencapaian (6 badge)
- 📱 Responsive mobile & desktop

---

## 🎨 Design System

| Elemen       | Pilihan                                     |
| ------------ | ------------------------------------------- |
| Font Display | Syne (800 weight)                           |
| Font Body    | DM Sans                                     |
| Font Mono    | JetBrains Mono                              |
| Style        | Glassmorphism + Neon Physics                |
| Tema         | Dark (default) / Light                      |
| Accent       | Purple #818cf8, Teal #2dd4bf, Amber #fbbf24 |
| Animasi      | Framer Motion + CSS transitions + Canvas    |

---

## 🛠 Tech Stack

| Bagian    | Teknologi                             |
| --------- | ------------------------------------- |
| Frontend  | React 18, Vite                        |
| Animasi   | Framer Motion                         |
| Styling   | Custom CSS (Variables, Glassmorphism) |
| Backend   | Express.js 4, Node.js                 |
| Database  | MongoDB, Mongoose                     |
| Desain    | Figma, SVG Animations                 |
| Dev Tools | Nodemon, Morgan                       |

---

## 📚 Referensi

- Halliday, Resnick & Walker — _Fisika Dasar_ (edisi ke-10)
- Arthur Beiser — _Konsep Fisika Modern_
- Khan Academy — Classical Mechanics
- PhET Interactive Simulations — University of Colorado Boulder
- Kurikulum Merdeka Fisika SMA — Kemendikbud 2022
- Framer Motion Documentation — framer.com/motion

---

## 👨‍💻 Developer

**Pasha Khatami Hasibuan**  
Mahasiswa Pendidikan Teknik Elektronika dan Informatika
Mata Kuliah:Sistem Multimedia  
Tahun Akademik: 2026

---

_SmartPhysics — Interactive Multimedia Learning System © 2026_
