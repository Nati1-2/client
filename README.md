# 🎟️ UniEvents - Client Frontend

Modern, responsive web application for university event discovery, registration, and management. Built with **React 19**, **Tailwind CSS**, and **React Router v7**.

---

## ✨ Features

- **🎓 Student Experience**:
  - Live event directory with category filtering (Tech, Arts, Sports, Workshops, etc.) and search.
  - Interactive event detail modal with schedule, venue, capacity, and organizer information.
  - One-click event registration with instant ticket code generation.
  - Dedicated Student Dashboard showing upcoming registered events and cancellation options.

- **🛡️ Admin Dashboard**:
  - Real-time statistics: Total events, total registrations, active attendees, and capacity utilization.
  - Complete Event CRUD: Create new events, edit details, delete events, or toggle featured status.
  - Attendee roster modal: View student registrations per event.

- **🔐 Authentication & Role Management**:
  - Secure login & registration for Students and Administrators.
  - Persistent auth tokens stored in `localStorage` with automated health check heartbeat.
  - Live API status and server latency indicator in the navigation bar.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (`react-scripts 5.0.1`)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v3.4 + PostCSS + Autoprefixer
- **Icons**: Inline Heroicons SVG system
- **Hosting**: Vercel (Configured with `vercel.json` for SPA rewrites and API proxies)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
CI=false
GENERATE_SOURCEMAP=false
```

### 3. Start Development Server
```bash
npm start
```
The app will run locally at [http://localhost:3000](http://localhost:3000).

---

## 📦 Production Build & Vercel Deployment

### Build Locally
```bash
npm run build
```

### Deploying to Vercel
1. Push this repository to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. Set the Environment Variables:
   - `CI`: `false`
   - `REACT_APP_API_URL`: Your live backend API URL
4. `vercel.json` will automatically route `/api/*` requests to your backend and handle React Router page refreshes without 404 errors.
