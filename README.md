# CineHub Frontend (FE)

Frontend codebase for **CineHub** — a movie streaming platform.

This repository currently contains **two separate frontend apps**:

- **User app** (movie streaming UI): `user/`
- **Admin dashboard** (management UI): `admin/`

> Note: At the moment, each app has its own standalone setup and `package.json`. You should run/install them **independently**.

---

## Repository Structure

```text
CineHub_FE/
├─ user/          # User-facing movie streaming app
└─ admin/         # Admin dashboard
```

---

## Tech Stack (high-level)

- Node.js + npm
- Vite (dev server via `npm run dev`)
- UI implementation is based on the provided Figma designs:
  - User: https://www.figma.com/design/yHOfua3kBKpXl07XLVPoLC/Movie-Streaming-App-Design
  - Admin: https://www.figma.com/design/6nWsH31O6NcPa5BOoEsimq/Admin-dashboard-for-movie-platform

---

## Getting Started

### 1) Prerequisites

- Node.js (recommend latest LTS)
- npm (comes with Node.js)

### 2) Run the **User** app

```bash
cd user
npm i
npm run dev
```

### 3) Run the **Admin** app

```bash
cd admin
npm i
npm run dev
```

---

## Development Notes

- If you need to run both apps at the same time, open **two terminals** and start each app separately.
- If you plan to connect to a backend (BE) API, you may need to add environment variables (e.g. API base URL) depending on how the FE source code is implemented.

---

## License

Add a license if needed.
