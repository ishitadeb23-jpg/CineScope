# CineScope 🎬

A full-stack movie discovery and review platform built with React, Node.js, Express, MongoDB and TMDB.

## Features
- Trending, popular and top-rated movies
- Search and movie details
- Cast and trailers
- User registration/login with JWT
- Personal watchlist
- Ratings and reviews
- Mood-based discovery
- Responsive cinematic UI

## Setup
### Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Server `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cinescope
JWT_SECRET=replace_with_a_long_random_secret
TMDB_BEARER_TOKEN=your_tmdb_read_access_token
CLIENT_URL=http://localhost:5173
```

Client `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Recommended deployment: Vercel (client), Render (server), MongoDB Atlas (database).
