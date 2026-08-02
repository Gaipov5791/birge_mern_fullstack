# Бирге / Birge

<p align="center">
  <strong>Connect · Share · Talk — together.</strong><br/>
  <em>Социальная сеть на MERN-стеке / A modern social network built with the MERN stack</em>
</p>

<p align="center">
  <a href="#-english">English</a> ·
  <a href="#-русский">Русский</a>
</p>

<p align="center">
  <a href="https://birge-mern-fullstack.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://github.com/Gaipov5791/birge_mern_fullstack"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-764ABC?logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/i18n-KG%20%7C%20RU%20%7C%20EN-3B82F6" alt="i18n" />
</p>

---

## 🇬🇧 English

### Overview

**Birge** is a full-stack social networking app where users can publish posts with photos and videos, follow people, leave comments, explore trends, and stay connected — in Kyrgyz, Russian, and English.

> Live demo: [birge-mern-fullstack.vercel.app](https://birge-mern-fullstack.vercel.app)

### Key Features

| Area | What you get |
|------|----------------|
| **Auth** | Email/password registration & login, Google OAuth |
| **Feed** | Cursor-based post timeline with likes, comments, and media |
| **Media** | Image & video uploads (Cloudinary), fullscreen preview |
| **Social** | Follow / unfollow, user profiles, recommended users |
| **Discovery** | Trends, hashtag feeds, user search |
| **UX** | Multilingual UI (KG / RU / EN), notifications, feedback form |
| **UI** | Dark theme, responsive layout (mobile & desktop) |

### Tech Stack

**Frontend**
- React 19 · Vite · React Router
- Redux Toolkit · Axios
- Tailwind CSS · Swiper · React Icons
- i18next (Kyrgyz / Russian / English)

**Backend**
- Node.js · Express
- MongoDB · Mongoose
- JWT · Passport (Google OAuth)
- Multer · Cloudinary
- Nodemailer · express-rate-limit

**Deploy**
- Frontend → **Vercel**
- Backend → **Render** (API)
- Database → **MongoDB Atlas**
- Media → **Cloudinary**

### Project Structure

```text
mern-birge_app/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # API services
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── redux/          # Redux store & slices
│   │   └── locales/        # KG / RU / EN translations
│   └── vercel.json
├── backend/                # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
├── .env.example
└── README.md
```

### Getting Started

#### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Google OAuth credentials (optional, for Google login)

#### 1. Clone the repository

```bash
git clone https://github.com/Gaipov5791/birge_mern_fullstack.git
cd birge_mern_fullstack
```

#### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` and set:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLIENT_URL=http://localhost:5173
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
DEVELOPER_EMAIL=
```

Start the API:

```bash
npm run start
# or with nodemon: npm run dev
```

#### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:5173
```

Start the client:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Highlights for Presentation

- Full MERN social product: auth → feed → profiles → media → discovery
- Production-ready deployment: Vercel + Render + MongoDB Atlas + Cloudinary
- Multilingual product experience (KG / RU / EN)
- Modern UI with dark theme and responsive design
- Secure auth (JWT + Google OAuth) and media handling via Cloudinary

---

## 🇷🇺 Русский

### О проекте

**Бирге** — fullstack-социальная сеть, где пользователи публикуют посты с фото и видео, подписываются друг на друга, комментируют, смотрят тренды и общаются — на кыргызском, русском и английском.

> Live demo: [birge-mern-fullstack.vercel.app](https://birge-mern-fullstack.vercel.app)

### Основные возможности

| Раздел | Что умеет |
|--------|-----------|
| **Авторизация** | Регистрация и вход по email/паролю, Google OAuth |
| **Лента** | Cursor-пагинация постов, лайки, комментарии, медиа |
| **Медиа** | Загрузка фото и видео (Cloudinary), полноэкранный просмотр |
| **Соц. связи** | Подписка / отписка, профили, рекомендации пользователей |
| **Открытия** | Тренды, ленты по хэштегам, поиск пользователей |
| **UX** | Мультиязычность (KG / RU / EN), уведомления, форма обратной связи |
| **Интерфейс** | Тёмная тема, адаптивная вёрстка (mobile & desktop) |

### Технологический стек

**Frontend**
- React 19 · Vite · React Router
- Redux Toolkit · Axios
- Tailwind CSS · Swiper · React Icons
- i18next (кыргызский / русский / английский)

**Backend**
- Node.js · Express
- MongoDB · Mongoose
- JWT · Passport (Google OAuth)
- Multer · Cloudinary
- Nodemailer · express-rate-limit

**Деплой**
- Frontend → **Vercel**
- Backend → **Render** (API)
- База данных → **MongoDB Atlas**
- Медиа → **Cloudinary**

### Структура проекта

```text
mern-birge_app/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # API-сервисы
│   │   ├── components/     # UI-компоненты
│   │   ├── pages/          # Страницы маршрутов
│   │   ├── redux/          # Redux store и slices
│   │   └── locales/        # Переводы KG / RU / EN
│   └── vercel.json
├── backend/                # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── config/
├── .env.example
└── README.md
```

### Быстрый старт

#### Требования

- Node.js 18+
- MongoDB (локально или Atlas)
- Аккаунт Cloudinary
- Google OAuth credentials (опционально)

#### 1. Клонирование

```bash
git clone https://github.com/Gaipov5791/birge_mern_fullstack.git
cd birge_mern_fullstack
```

#### 2. Backend

```bash
cd backend
npm install
```

Создайте `.env` по образцу `.env.example` и заполните переменные (см. English-секцию выше).

Запуск API:

```bash
npm run start
# или: npm run dev
```

#### 3. Frontend

```bash
cd client
npm install
```

Создайте `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:5173
```

Запуск клиента:

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

### Акценты для презентации

- Полноценный MERN-продукт: авторизация → лента → профили → медиа → discovery
- Боевой деплой: Vercel + Render + MongoDB Atlas + Cloudinary
- Мультиязычный интерфейс (KG / RU / EN)
- Современный UI: тёмная тема и адаптив
- Безопасная авторизация (JWT + Google OAuth) и медиа через Cloudinary

---

## Author / Автор

**Gaipov5791**  
GitHub: [github.com/Gaipov5791](https://github.com/Gaipov5791)  
Repository: [birge_mern_fullstack](https://github.com/Gaipov5791/birge_mern_fullstack)

---

<p align="center">
  Made with 💙 for <strong>Бирге</strong> · Connect, Share, Talk — together.
</p>
