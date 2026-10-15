# InternTrack - Internship Application Tracker

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/)

An intuitive, fast, and feature-rich full-stack MERN application to manage and organize your internship job search pipeline. Stay ahead of deadlines, track application stages, and draft personalized follow-up emails with AI.

---

## 🔗 Live Demo & Links

- **Live Application**: `<!-- Placeholder: https://interntrack-client.vercel.app -->`
- **Backend API**: `<!-- Placeholder: https://interntrack-api.onrender.com -->`
- **Repository**: `<!-- Placeholder: https://github.com/your-username/InternTrack -->`

---

## 📸 Screenshots

> *Add visual screenshots or GIFs of your running application below:*

```
+-------------------------------------------------------------------------------+
|  [Screenshot Placeholder 1: Dashboard with Stats Cards and Application Table]  |
|  <!-- Place screenshot image here: ![Dashboard](docs/screenshots/dashboard.png) -->
+-------------------------------------------------------------------------------+
|  [Screenshot Placeholder 2: AI Follow-Up Generator Modal with Copy Action]   |
|  <!-- Place screenshot image here: ![AI Modal](docs/screenshots/ai_modal.png) -->
+-------------------------------------------------------------------------------+
|  [Screenshot Placeholder 3: User Authentication (Login & Register Pages)]    |
|  <!-- Place screenshot image here: ![Auth Pages](docs/screenshots/auth.png) -->
+-------------------------------------------------------------------------------+
```

---

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing and token persistence.
- **Data Isolation**: Each user can strictly view, search, modify, and delete only their own internship applications.
- **Application Pipeline Dashboard**:
  - **Real-Time Analytics Cards**: Quick breakdown of applications across `Total`, `Applied`, `Interview`, `Offer`, and `Rejected` stages.
  - **Interactive Filtering**: Filter applications by clicking directly on status metric cards or using the dropdown filter.
  - **Live Search**: Instant search by company name or role.
  - **Inline Status Updates**: Seamlessly update application status (`Applied` &rarr; `Interview` &rarr; `Offer` &rarr; `Rejected`) right from the table row without opening edit forms.
  - **Full CRUD Management**: Add new applications, edit existing entries, and safely delete entries with a confirmation modal.
- **AI-Powered Follow-Up Generator (Groq API)**:
  - Generate polite, professional, and personalized follow-up emails for recruiters based on company, role, and current status.
  - Integrated one-click copy to clipboard action.
- **Responsive & Modern UI**: Built with Tailwind CSS, smooth micro-interactions, custom scrollbars, loading states, and toast notifications.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS (v3), Lucide React icons
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios with global JWT request & response interceptors

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database & ODM**: MongoDB Atlas with Mongoose
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **AI Integration**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)

---

## 📁 Project Structure

```text
InternTrack/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe handlers
│   │   ├── applicationController.js # CRUD, search, filter & stats
│   │   └── aiController.js       # Groq AI follow-up generator
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token verification
│   │   └── errorMiddleware.js    # 404 & centralized error handler
│   ├── models/
│   │   ├── User.js               # User schema & bcrypt password hashing
│   │   └── Application.js        # Internship application schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── applicationRoutes.js  # /api/applications routes
│   │   └── aiRoutes.js           # /api/ai routes
│   ├── tests/
│   │   └── api.test.js           # 20 automated integration tests
│   ├── server.js                 # Express server configuration
│   ├── .env.example              # Server environment template
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Pre-configured Axios instance
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation & user session header
│   │   │   ├── ProtectedRoute.jsx# Auth route gate
│   │   │   ├── StatsCards.jsx    # Metric summaries & quick filter
│   │   │   ├── ApplicationModal.jsx # Add/edit modal dialog
│   │   │   ├── DeleteConfirmModal.jsx # Safe deletion prompt
│   │   │   └── FollowUpModal.jsx # AI message display & copy modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state, login, register, logout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Main application tracker page
│   │   │   ├── Login.jsx         # Sign in page
│   │   │   └── Register.jsx      # Sign up page
│   │   ├── App.jsx               # Routes setup
│   │   ├── main.jsx              # DOM entry point
│   │   └── index.css             # Tailwind base & utilities
│   ├── vercel.json               # SPA rewrites config for Vercel
│   ├── .env.example              # Client environment template
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/interntrack` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `GROQ_API_KEY` | *(Optional)* Groq Cloud API key for AI follow-up generator | `gsk_...` |

### Frontend (`client/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend API | `http://localhost:5000` |

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/InternTrack.git
cd InternTrack
```

### 3. Backend Setup
```bash
cd server
npm install

# Create .env from template
cp .env.example .env
# Edit server/.env with your MONGO_URI and JWT_SECRET
```

Run backend test suite:
```bash
npm test
```

Start backend development server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd client
npm install

# Create .env from template
cp .env.example .env

# Start frontend dev server
npm run dev
# Vite runs on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Log in user (`email`, `password`) & receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current user profile |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/applications` | Private | Get user applications (supports `?status=` and `?search=`) |
| `POST` | `/api/applications` | Private | Create new application (`company`, `role`, `status`, etc.) |
| `PUT` | `/api/applications/:id` | Private | Update application details or status |
| `DELETE` | `/api/applications/:id` | Private | Delete application by ID |
| `GET` | `/api/applications/stats` | Private | Return status counts (`total`, `Applied`, `Interview`, `Offer`, `Rejected`) |

### AI Features (`/api/ai`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/followup` | Private | Generate AI follow-up email (`company`, `role`, `status`) |

---

## 🌐 Deployment Instructions

### 1. Deploying the Backend on Render
1. Go to [Render.com](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository and specify the **Root Directory** as `server`.
3. Set the following build and start commands:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the **Environment Variables** tab, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_production_secret`
   - `CLIENT_URL`: `https://your-client-app.vercel.app`
   - `GROQ_API_KEY`: `your_groq_api_key` *(optional)*
5. Click **Deploy Web Service** and copy your backend URL (e.g. `https://interntrack-api.onrender.com`).

### 2. Deploying the Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com/) and create a **New Project**.
2. Select your repository and configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://interntrack-api.onrender.com` *(your deployed Render backend URL)*
4. Click **Deploy**. Vercel will build the project using the SPA rewrite rules in `client/vercel.json`.

---

## 💡 Interview Architecture Guide: Auth & Data Flow

### 1. Authentication Flow
1. **User Registration / Login**:
   - The user submits their email and password through the React UI.
   - The server validates input and hashes the password using `bcryptjs` (with salt rounds = 10) before persisting to MongoDB.
   - Upon verification, the server creates a signed **JSON Web Token (JWT)** containing the user's `_id` and an expiration time (30 days), signed with `JWT_SECRET`.
2. **Client Token Storage**:
   - The client stores the JWT in `localStorage` and saves the user identity in React `AuthContext`.
3. **Protected Requests (Interceptors)**:
   - An Axios request interceptor automatically attaches `Authorization: Bearer <token>` to all outgoing API calls.
4. **Backend Auth Verification**:
   - The `protect` middleware extracts the token from the header, verifies it with `jwt.verify()`, and fetches the user from the database (excluding password).
   - If valid, `req.user` is attached to the request; if invalid or expired, a 401 JSON error is returned, prompting the client interceptor to clear the session and redirect to `/login`.

### 2. Data Flow & Multi-Tenant Isolation
1. **Scoped Queries**:
   - Every application document contains a `user` ObjectId referencing the owning `User`.
   - When any CRUD action is dispatched (`find`, `create`, `findByIdAndUpdate`, `findOneAndDelete`, or `aggregate`), the database query is strictly filtered by `{ user: req.user._id }`.
   - Even if an attacker guesses a valid ObjectId belonging to another user, MongoDB returns `null`, triggering a 404 response and preserving tenant isolation.
2. **Real-Time Client Updates**:
   - State updates in `Dashboard.jsx` (adding, editing, deleting, or changing an inline status dropdown) immediately update the local React state and trigger an asynchronous refresh of the status analytics cards (`/api/applications/stats`).

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
