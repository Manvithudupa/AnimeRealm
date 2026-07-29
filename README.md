# 🎬 AnimeRealm

A modern, feature-rich anime streaming platform built with React. Integrates with the **Shirayuki Scrapper API v2** to aggregate content from multiple anime providers (HiAnime, Anixo, AnimeX, Anikuro, Nyaa.si) into a unified, seamless experience.

## ✨ Features

- **Unified Discovery** — Browse trending, popular, airing, and upcoming anime from multiple providers
- **Advanced Search** — Full-text search with autocomplete suggestions + advanced filtering (genre, season, year, status, type)
- **Anime Details** — Synopsis, scores, studios, genres, seasons/parts, character lists, and recommendations
- **Video Player** — HLS-based streaming with subtitle support, intro/outro skipping, auto-play, and auto-next
- **Episodic Browsing** — Chronological episode lists with click-to-watch navigation
- **User System** — Supabase Auth-powered accounts with watchlists and continue-watching
- **Responsive Design** — Fully responsive dark-themed UI optimized for both desktop and mobile

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (for auth, watchlist, continue-watching features)
- The Shirayuki Scrapper API v2 (deployed or self-hosted)

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SHIPAYUKI_API_URL` | Base URL of the deployed Shirayuki API |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_ANIMEPAHE_M3U8_PROXY` | (Optional) M3U8 proxy URL for HLS streaming |
| `VITE_PROXY_URL` | (Optional) General proxy URL for thumbnails |

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Supabase Setup

Run the migration in `supabase/migrations/20260729000000_initial_schema.sql` in your Supabase SQL editor to create the required tables:

- `watchlists` — User anime watchlists with status tracking
- `continue_watching` — Progress tracking per anime
- `notifications` — Episode release notifications

Then enable Supabase Auth (email/password or OAuth providers) in your Supabase dashboard.

## 🏗 Architecture

### API Layer

The app uses the **Shirayuki Scrapper API v2** as its data source. All API calls go through `src/config/api.js` which provides:

- `apiUrl(path)` — Builds full URLs with the configured provider prefix
- `ENDPOINTS` — Named endpoint constants

Response data is transformed in utility functions under `src/utils/` to match the shapes expected by the React components.

### Data Flow

```
Pages/Components
    ↕
Custom Hooks (useWatch, useWatchMultiSource, useAuth…)
    ↕
Utility Functions (getHomeInfo, getAnimeInfo, getEpisodes…)
    ↕
apiUrl() → axios.get() → Shirayuki Scrapper API v2
```

### Key Files

| Path | Purpose |
|------|---------|
| `src/config/api.js` | API configuration & endpoint builders |
| `src/utils/getHomeInfo.utils.js` | Homepage data (spotlight, trending, top 10) |
| `src/utils/getAnimeInfo.utils.js` | Anime detail metadata |
| `src/utils/getEpisodes.utils.js` | Episode list for an anime |
| `src/utils/getServers.utils.js` | Available streaming servers |
| `src/utils/getStreamInfo.utils.js` | Streaming sources (m3u8 URLs, subtitles) |
| `src/utils/getSearch.utils.js` | Keyword search |
| `src/utils/getSearchSuggestion.utils.js` | Autocomplete suggestions |
| `src/hooks/useWatchMultiSource.js` | Main watch page state management |

### Shirayuki API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v2/{provider}/home` | Homepage data |
| `GET /api/v2/{provider}/anime/{id}` | Anime details |
| `GET /api/v2/{provider}/anime/{id}/episodes` | Episode list |
| `GET /api/v2/{provider}/search` | Basic search |
| `GET /api/v2/{provider}/search/advanced` | Filtered search |
| `GET /api/v2/{provider}/search/suggestion` | Autocomplete |
| `GET /api/v2/{provider}/category/{name}` | Category browsing |
| `GET /api/v2/{provider}/genre/{name}` | Genre pages |
| `GET /api/v2/{provider}/azlist/{letter}` | A-Z listing |
| `GET /api/v2/{provider}/producer/{name}` | Producer/studio pages |
| `GET /api/v2/{provider}/episode/servers` | Episode server list |
| `GET /api/v2/{provider}/episode/sources` | Streaming sources |
| `GET /api/v2/{provider}/schedule` | Airing schedule |

## 🧩 Component Tree

```
App
├── SplashScreen (/) – Landing/search page
├── Home – Trending, spotlight, categories
│   ├── Spotlight – Hero banner carousel
│   ├── Trending – Horizontal trending strip
│   ├── CategoryCard – Section grids (Latest, Popular, etc.)
│   └── Topten – Top 10 sidebar rankings
├── Watch – Video player page
│   ├── Player – HLS video player
│   ├── Servers – Server selector (HD-1, HD-2, etc.)
│   ├── Episodelist – Episode navigation
│   └── Watchcontrols – Autoplay, skip, auto-next toggles
├── AnimeInfo – Detailed anime metadata page
├── Search – Search results with pagination
├── Filter – Genre-based filtering
├── Category / AtoZ / Producer / Schedule – Browse pages
└── Auth – Login/signup
```

## 🛠 Technologies

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Supabase** for auth & database
- **Artplayer + HLS.js** for video playback
- **Swiper** for carousels
- **Axios** for HTTP requests

## 📝 Notes

- Anime IDs on the Shirayuki API are **slug-based** (e.g., `attack-on-titan`) rather than numeric Anilist IDs
- The `/next-episode-schedule` endpoint is not available in the current Shirayuki API version
- Episode IDs follow the format `slug/ep-N` (e.g., `attack-on-titan/ep-1`)
- The M3U8 proxy env var (`VITE_ANIMEPAHE_M3U8_PROXY`) is only needed if you want to proxy HLS streams through a CORS-friendly server

## 📄 License

MIT
