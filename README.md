# InternTrack — Internship Application Tracker

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/)

A modern, full-stack MERN application designed to help job seekers organize, track, and manage their internship application pipeline in one centralized workspace. Features real-time status metrics, instant search and filtering, and AI-generated follow-up emails powered by Groq.

---

## 🔗 Links
intern-track-blond.vercel.app
- **Live Demo**: [intern-track-blond.vercel.app]
- **GitHub Repository**: [https://github.com/NagaTejaSriCore/InternTrack](https://github.com/NagaTejaSriCore/InternTrack)

---

## 📸 Screenshots

| Dashboard Overview | AI Follow-Up Generator | Authentication |
| :---: | :---: | :---: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Follow-Up Generator](docs/screenshots/followup.png) | ![Login](docs/screenshots/login.png) |

---

## ✨ Key Features

- **JWT Authentication & Security**: Secure user signup/login using bcrypt password hashing, JWT tokens with Bearer auth, and strict user data isolation.
- **Pipeline Analytics**: Real-time summary cards displaying counts across `Total`, `Applied`, `Interview`, `Offer`, and `Rejected` stages.
- **Live Search & Filter**: Filter applications instantly by clicking status cards or searching across company and role fields.
- **Inline Status Updates**: Seamlessly progress applications through hiring stages directly from the table without opening modals.
- **Full Application CRUD**: Create, edit, and safely delete job applications with details, posting links, dates, and interview notes.
- **AI Follow-Up Assistant**: Generate context-tailored, professional recruiter follow-up emails in seconds using the Groq API.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Axios
- **Backend**: Node.js, Express.js, REST API architecture
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **AI Engine**: Groq API (`openai/gpt-oss-120b`, configurable via `GROQ_MODEL`)
- **Testing**: Node.js native test runner & Supertest (20 integration tests)

---

## 🧠 How It Works

Authentication is handled via JWT tokens and bcrypt password hashing, with client requests authenticated through an Axios Bearer token interceptor.
On the backend, every database query and mutation is strictly scoped to `req.user._id`, ensuring absolute data isolation across users.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `your_mongodb_connection_string` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_jwt_secret` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `GROQ_API_KEY` | Groq Cloud API key | `your_groq_api_key` |
| `GROQ_MODEL` | Groq chat completion model | `openai/gpt-oss-120b` |

### Frontend (`client/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend API | `http://localhost:5000` |

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/NagaTejaSriCore/InternTrack.git
cd InternTrack

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment Files
- Copy `server/.env.example` to `server/.env` and supply your `MONGO_URI`, `JWT_SECRET`, and optional `GROQ_API_KEY`.
- Copy `client/.env.example` to `client/.env` (defaults to `VITE_API_URL=http://localhost:5000`).

### 3. Run Application
```bash
# Terminal 1: Start backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2: Start frontend (http://localhost:5173)
cd client && npm run dev
```

### 4. Run Backend Tests
```bash
cd server && npm test
```

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `GET` | `/api/applications` | Private | Fetch applications (supports `?status=` and `?search=`) |
| `POST` | `/api/applications` | Private | Create a new application entry |
| `PUT` | `/api/applications/:id` | Private | Update application details or inline status |
| `DELETE` | `/api/applications/:id` | Private | Remove application by ID |
| `GET` | `/api/applications/stats`| Private | Retrieve application status metrics breakdown |
| `POST` | `/api/ai/followup` | Private | Generate AI follow-up message using Groq |

---

## 🌐 Deployment

1. **Backend (Render)**: Deploy as a Web Service pointing to the `server/` root directory using `npm install` (Build) and `npm start` (Start).
2. **Frontend (Vercel)**: Import repository with root directory set to `client/` (Vite preset) and set `VITE_API_URL` to your backend URL.
3. **CORS Configuration**: Set `CLIENT_URL` in backend environment variables to your deployed frontend domain.
