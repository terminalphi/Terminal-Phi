# Terminal Phi

[![Vite](https://img.shields.io/badge/Vite-8.1.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.108-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

An immersive, high-performance web portal built for **Terminal Phi**, an independent collective of developers, competitive programmers, and builders. The platform incorporates a retro-futuristic terminal interface, WebGL backgrounds, interactive SVGs, candidate recruitment workflows, and a multi-platform coding stats aggregator dashboard.

Live at: **[terminalphi.xyz](http://terminalphi.xyz)**

---

## Table of Contents
1. [About Terminal Phi](#about-terminal-phi)
2. [Key Website Features](#key-website-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables Setup](#environment-variables-setup)
   - [Frontend Installation](#frontend-installation)
   - [Backend Installation](#backend-installation)
6. [Deployment](#deployment)

---

## About Terminal Phi

**Terminal Phi** is a society for the deeply obsessed—problem solvers drawn together not by ambition, but by a quieter compulsion to create. We are an independent collective building the tech society we wish existed: no bureaucracy, no gatekeeping.

### Core Objectives
*   **Real Project Building:** Moving past toy models. We design and ship tools that work in the real world—from distributed backends to production ML pipelines.
*   **Rigorous Problem Solving:** Using competitive programming as a continuous mental exercise to sharpen system reasoning.
*   **Computer Science Fundamentals:** Paying off technical debt by mastering Operating Systems, Database Management Systems, Computer Networks, and Object-Oriented Design.
*   **Scale and Architecture:** Exploring modern system designs that withstand traffic, latency, and real-world failure cases.

---

## Key Website Features

### 🌌 Immersive User Experience & UI
*   **Vibrant Cyberpunk Aesthetics:** Curved grid graphics, neon accent lights, and custom page transitions (`enter` / `exit` animations via CSS classes).
*   **WebGL Background (Threads):** Custom WebGL shader-based interactive background rendering smooth waves of glowing strings.
*   **Hardware-Aware Quality Scaling:** The app dynamically measures the device tier (mobile, low-spec desktop, high-spec desktop) and caps the FPS, canvas device-pixel-ratio (DPR), and line counts to prevent UI stuttering on weaker devices.
*   **Retro Desktop Companion (Oneko):** An interactive retro-animated kitten that wakes up and chases the user's mouse cursor around the viewport.

### 📟 Interactive Global Terminal Overlay
*   Pressing **`Ctrl + ~`** (or **`Ctrl + `** ` ** ) triggers a full-screen terminal shell anywhere on the site.
*   **Custom Shell Commands:**
    *   `whoami`: Displays information about the society.
    *   `goto <route>`: Navigates cleanly to pages like `/about_us`, `/activities`, `/events`, `/team`, `/join_us`, or `/dashboard`.
    *   `theme <cyan/rose/green/purple/gold/default>`: Dynamically mutates CSS root variables across the entire application to swap themes on the fly.
    *   `socials`: Pulls up formatted hyperlinks to Instagram, LinkedIn, and GitHub.
    *   `cowsay <text>`: Standard UNIX cowsay emulator for interactive feedback.
    *   `clear` & `exit` commands.

### 📊 Coding Stats Aggregator & Dashboard
*   Users can sign in securely and link their usernames for major competitive coding platforms.
*   **Multi-Platform Scraper:** A Python concurrent scraper fetches user statistics asynchronously:
    *   **LeetCode** (Solved counts, difficulty breakdown, acceptance rate)
    *   **Codeforces** (Current rating, max rating, rank)
    *   **CodeChef** (Rating, global rank, stars)
    *   **GeeksforGeeks** (Overall coding score, problems solved)
    *   **HackerRank** (Badges & challenges completed)
*   **Activity Heatmap:** Uses `react-activity-calendar` to draw a contribution map of user progress.

### 📝 Membership Application Portal
*   Integrated candidate application workflow submitting candidate records directly to a PostgreSQL database hosted on Supabase via the `Candidates_data_table` table.
*   Authenticates applications via email and enforces client-side validation logic (such as strict 10-digit mobile number rules and duplicate roll-number database checks).

---

## Technology Stack

### Frontend
*   **Library:** React 19 + Vite 8 (Single Page App)
*   **Animations:** Vanilla CSS transitions + GSAP (GreenSock Animation Platform)
*   **Styling:** Pure Vanilla CSS with centralized CSS variables (`themeColors.js`)
*   **Routing:** React Router DOM v7
*   **Graphics:** Canvas-based 2D render loops + OGL (Minimal WebGL Library)
*   **Database Client:** Supabase JS v2
*   **Visualizations:** React Activity Calendar + Recharts

### Backend
*   **Framework:** Flask 3.1
*   **Concurrency:** Python `concurrent.futures.ThreadPoolExecutor` for parallel platform scraping
*   **HTML Parsing & Scraping:** BeautifulSoup4 (BS4) + Requests
*   **CORS Management:** Flask-CORS
*   **Production Server:** Gunicorn

---

## Project Structure

```text
Terminal-Phi/
├── backend/
│   ├── api/
│   │   ├── fetchers/       # Multi-platform scrapers (LeetCode, GFG, CC, etc.)
│   │   └── index.py        # Flask API routing & multi-threaded endpoint
│   ├── requirements.txt    # Python dependencies
│   └── vercel.json         # Vercel serverless routing configuration
├── frontend/
│   ├── public/             # Static web assets (fonts, video)
│   ├── src/
│   │   ├── components/     # UI modules (Hero, Terminal, About, Activities, etc.)
│   │   ├── pages/          # React router screen pages
│   │   ├── App.jsx         # App routes, terminal event listeners & themes
│   │   ├── auth.js         # Supabase connection & OAuth configuration
│   │   ├── index.css       # Core design utility tokens
│   │   └── deviceTier.js   # Hardware assessment checks
│   ├── vite.config.js      # Bundler settings
│   └── vercel.json         # Redirects config for SPA fallback
└── README.md
```

---

## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python](https://www.python.org/) (v3.9 or higher recommended)
*   [Supabase Account](https://supabase.com/) (For Auth & Candidate data persistence)

### Environment Variables Setup

Create a `.env` file inside `/frontend` containing the following Supabase client credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_api_key
```

### Frontend Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The client site should launch locally on `http://localhost:5173`.*

### Backend Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Spin up the local development API server:
   ```bash
   python api/index.py
   ```
   *The backend server will run on `http://localhost:5000` exposing `/api/stats` and `/api/health`.*

---

## Deployment

The project is structured to deploy smoothly on **Vercel** as a monorepo.
*   The **Frontend** builds using `npm run build` and serves static React assets.
*   The **Backend** spins up Vercel Serverless Python Functions matching the rules in `backend/vercel.json`.
