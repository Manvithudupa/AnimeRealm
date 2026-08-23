<div align="center">

# 🎌 An!meRealm

**Free, ad-free anime streaming platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-green.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8.svg)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3fcf8e.svg)](https://supabase.com)

[🌐 Live Site](https://animerealm.in) · [📖 API Docs](https://kenjitsu-docs.vercel.app/) · [🐛 Report Bug](https://github.com/Manvith911/AnimeRealm/issues)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 Discovery
- **Trending, Airing, Popular, Upcoming** — curated home sections
- **Genre & Category Browsing** — 40+ genre filters
- **A–Z List** — full alphabetical catalog
- **Search with Suggestions** — instant autocomplete
- **Airing Schedule** — see what's dropping today

</td>
<td width="50%">

### ▶️ Playback
- **Multi-Provider Failover** — AniBD → AniDB → Anikoto → Animeheaven → Anizone
- **HLS Streaming** — quality selection, subtitle tracks, intro/outro skip
- **Auto-Play & Auto-Next** — binge-friendly controls
- **Download Options** — when direct sources are available
- **Progress Saving** — resume where you left off

</td>
</tr>
<tr>
<td>

### 👤 Account Features
- **Authentication** — email/password + Google OAuth
- **Watchlist** — organize by status (Watching, Completed, etc.)
- **Continue Watching** — cross-device progress sync
- **Notifications** — new episode alerts
- **Profile Customization** — avatar, banner, bio
- **AniList Import** — sync your AniList library

</td>
<td>

### 🎨 Design
- **Cinematic Dark Mode** — default theme
- **Light Mode** — full support
- **Responsive** — mobile, tablet, desktop
- **Animated Spotlight** — featured anime carousel
- **Keyboard Navigation** — accessible focus states
- **PWA Ready** — installable on any device

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) or npm

### Setup

```bash
# Clone the repo
git clone https://github.com/Manvith911/AnimeRealm.git
cd AnimeRealm

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Start dev server
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite dev server |
| `pnpm run build` | Production build + PWA service worker |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | Run ESLint |
| `pnpm run host` | Dev server with network access |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_KENJITSU_API_URL` | No | `https://kenjitsu.koyeb.app` | Kenjitsu API base URL |
| `VITE_ANIME_PROVIDER` | No | `anibd` | Preferred playback provider |
| `VITE_M3U8_PROXY_URL` | No | — | HLS proxy for CORS/Referer issues |
| `VITE_SUPABASE_URL` | No | — | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No | — | Supabase anon/public key |

> 💡 **Supabase is optional** — public browsing and playback work without it. Auth features require Supabase configuration.

---

## 🏗️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18, React Router 6 |
| **Build Tool** | Vite 5, PWA Plugin |
| **Styling** | Tailwind CSS, CSS Modules, shadcn/ui |
| **Video Player** | Artplayer, HLS.js |
| **State & Data** | React Context, Axios, localStorage caching |
| **Auth & DB** | Supabase Auth, Supabase PostgreSQL |
| **Icons** | FontAwesome, Lucide, React Icons |
| **UI Components** | Radix UI, Swiper, class-variance-authority |
| **Analytics** | Vercel Analytics, Vercel Speed Insights |
| **Deployment** | Vercel |

</div>

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── banner/          # Hero banner carousel
│   ├── categorycard/    # Anime grid cards
│   ├── continue/        # Continue watching slider
│   ├── episodelist/     # Episode list with search/sort
│   ├── navbar/          # Top navigation bar
│   ├── notifications/   # Notification bell & dropdown
│   ├── player/          # Artplayer/HLS video player
│   ├── searchbar/       # Web & mobile search
│   ├── servers/         # Provider/language selection
│   ├── sidebar/         # Mobile nav drawer
│   ├── spotlight/       # Featured anime swiper
│   ├── suggestion/      # Search autocomplete
│   ├── topten/          # Top 10 ranking cards
│   ├── trending/        # Trending anime slider
│   └── ui/              # shadcn primitives (Button, Input, etc.)
├── config/              # API config & constants
├── context/             # React contexts (Theme, Language, Search, HomeInfo)
├── hooks/               # Custom hooks (Auth, Watch, Notifications)
├── integrations/        # Supabase client & types
├── pages/               # Route-level views
│   ├── Home/            # Discovery homepage
│   ├── watch/           # Video player page
│   ├── animeInfo/       # Anime detail page
│   ├── Auth/            # Login & signup
│   ├── Profile/         # User profile editor
│   ├── watchlist/       # Saved anime list
│   ├── notifications/   # Notification center
│   ├── Settings/        # Theme & AniList import
│   ├── search/          # Search results
│   ├── filter/          # Genre filter
│   ├── schedule/        # Airing schedule
│   └── category/        # Genre/category browsing
└── utils/               # API adapters & normalizers
    ├── getHomeInfo.utils.js
    ├── getSearch.utils.js
    ├── getAnimeInfo.utils.js
    ├── streamingProviders.utils.js
    └── ...              # 19 utility modules
```

---

## 🎬 API Integration

AniList powers all **catalog and metadata** (search, details, episodes, characters, schedules). Streaming providers power **playback** (source URLs, subtitles, quality).

### Provider Failover Flow

```
User selects episode
        │
        ▼
  Resolve AniList ID → Provider ID (via mappings endpoint)
        │
        ▼
  Fetch provider episodes
        │
        ▼
  Request sources (version=sub|dub|raw)
        │
        ├── ✅ Play first source
        │
        └── ❌ Source fails
              │
              ▼
        Try next source from same provider
              │
              └── ❌ All sources failed
                    │
                    ▼
              Try next provider (AniBD → AniDB → ...)
```

### Supported Providers

| Provider | Episodes | Sources | Quality Selection |
|----------|----------|---------|-------------------|
| AniBD | ✅ | ✅ | ✅ |
| AniDB | ✅ | ✅ | ✅ |
| Anikoto | ✅ | ✅ | ✅ |
| Animeheaven | ✅ | ✅ | ✅ |
| Anizone | ✅ | ✅ | ✅ |

> 📖 Full API documentation: [kenjitsu-docs.vercel.app](https://kenjitsu-docs.vercel.app/)

---

## 🗄️ Supabase Setup (Optional)

AnimeRealm works without Supabase. To enable accounts and personal features:

1. Create a [Supabase project](https://supabase.com)
2. Run the migration in `supabase/migrations/20260729000000_initial_schema.sql`
3. Enable auth providers in the Supabase dashboard
4. Add your credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Username, avatar, banner |
| `watchlists` | Saved anime with status |
| `continue_watching` | Episode progress & resume |
| `notifications` | New episode alerts |

---

## 🚢 Deployment

Deploy to **Vercel** (or any static host):

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set build command: `pnpm run build`
4. Add environment variables
5. Deploy

```bash
# Or deploy via CLI
npx vercel --prod
```

> ⚠️ Set `VITE_M3U8_PROXY_URL` if streaming providers return 403/CORS errors.

---

## 🤝 Contributing

```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make changes and verify
pnpm run lint
pnpm run build

# Commit
git commit -m "feat: add amazing feature"

# Push and open a PR
git push origin feature/amazing-feature
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file.

---

<div align="center">

**Made with ❤️ by [Manvith](https://github.com/Manvith911)**

[⬆ Back to top](#-anme.realm)

</div>
