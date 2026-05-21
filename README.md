# Joys Hidden Beauty — Enterprise Wellness & Booking Platform

Joys Hidden Beauty is a high-end, modern web application designed for a luxury beauty, skin health, and aesthetics salon. The platform delivers an elegant client experience featuring a comprehensive booking engine, user accounts, customizable skin/beauty profiling, and secure payment processing.

---

## 🏛️ System Architecture

The application is structured as a decoupled monorepo containing a modern React frontend and a fast, type-safe Python backend:

```
                                  +-----------------------+
                                  |     Client Browser    |
                                  +-----------+-----------+
                                              |
                                     HTTPS    |   Secure JSON Web Tokens
                                              v
                      +-----------------------+-----------------------+
                      |                                               |
                      v                                               v
          +-----------+-----------+                       +-----------+-----------+
          |   Next.js Frontend    |                       |    FastAPI Backend    |
          |       (Vercel)        |                       |   (Render/Railway)    |
          +-----------------------+                       +-----------+-----------+
                                                                      |
                                                                      |  SQLAlchemy
                                                                      v
                                                          +-----------+-----------+
                                                          |  PostgreSQL Database  |
                                                          |    (Cloud Hosted)     |
                                                          +-----------------------+
```

* **Frontend:** Next.js (React 19, TypeScript, Tailwind CSS v4, Framer Motion animations). Optimized for server-side rendering (SSR), premium responsive aesthetics, and smooth micro-animations.
* **Backend:** FastAPI (Python 3.10+, SQLAlchemy ORM, Pydantic data validation). Optimized for high throughput, asynchronous operation, and secure session management.
* **Database:** Production PostgreSQL with local development fallback to SQLite.
* **Payments:** Fully integrated with OPay checkout API for secure, PCI-compliant credit card transactions.

---

## 📂 Directory Structure

```
joys-hidden-beauty/
├── backend/
│   ├── app/
│   │   ├── api/            # API Router endpoints (auth, users, booking, shop)
│   │   ├── core/           # Security, database connection, and environment settings
│   │   ├── models/         # SQLAlchemy DB models (user, appointment, order, profile)
│   │   ├── services/       # Core business logic (OPay checkout, email notifications)
│   │   └── main.py         # Application entrypoint
│   ├── scripts/            # Database migrations and administration utilities
│   ├── .env.example        # Reference environment configuration
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/             # Static luxury vector assets and emblems
│   ├── src/
│   │   ├── app/            # Next.js App Router (layout, pages, routing)
│   │   ├── components/     # UI design system and stateful client components
│   │   ├── lib/            # HTTP client helpers and API wrapper classes
│   │   └── services/       # Frontend service layers
│   ├── .env.example        # Reference frontend environment configuration
│   ├── package.json        # Node.js dependencies & scripts
│   └── tsconfig.json       # TypeScript configuration
└── README.md               # Root developer documentation
```

---

## 🚀 Local Development Setup

### 1. Backend Service Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure local environment variables:
   * Copy `.env.example` to `.env` and adjust database credentials or payment keys. By default, it will fall back to SQLite if no PostgreSQL URL is provided.
5. Start the development server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000) with interactive documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Web Application Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure local environment variables:
   * Copy `.env.example` to `.env.local` and define `NEXT_PUBLIC_API_URL=http://localhost:8000`.
4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   The application will load at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Production Deployment

### Frontend Deployment (Vercel)
1. Import your GitHub repository into Vercel.
2. In **Project Settings**:
   * Set **Framework Preset** to `Next.js`.
   * Set **Root Directory** to `frontend`.
3. Add the following **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: The live secure URL of your hosted backend.
   * `NEXT_PUBLIC_APP_URL`: The live secure URL of your frontend.
4. Click **Deploy**. Vercel will automatically configure global CDN caching and build optimization.

### Backend Deployment (Render or Railway)
1. Create a new **Web Service** on your cloud platform and link the GitHub repository.
2. Set **Root Directory** to `backend`.
3. Configure settings:
   * **Runtime:** `Python 3` (or Docker, if preferred).
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Provision a **PostgreSQL Database** on the platform and set the following **Environment Variables**:
   * `DATABASE_URL`: The secure PostgreSQL connection URI (e.g. `postgresql://...`).
   * `SECRET_KEY`: A high-entropy cryptographic string to sign JSON Web Tokens.
   * `APP_ENV`: `production`
   * `FRONTEND_URL`: Your secure frontend application URL.
   * `OPAY_PUBLIC_KEY` & `OPAY_SECRET_KEY` & `OPAY_MERCHANT_ID`: Your production OPay API gateway credentials.
   * `SMTP_PASSWORD`: App password for outgoing emails.

---

## 🔒 Corporate Compliance & Security
* **Data Transmission:** All production API endpoints and client interactions must run over strict TLS (HTTPS).
* **Payment Standards:** No cardholder data is stored on-premise. All credit card processing utilizes modern, tokenized OPay integrations.
* **Authentication:** Customer sessions are handled securely using JSON Web Tokens (JWT) stored in secure, HttpOnly client states.
* **Configuration Safety:** Never commit active production environment secrets, API keys, or databases to version control.

---

*Copyright © 2026 Joys Hidden Beauty. All rights reserved.*
