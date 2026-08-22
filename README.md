# AnimeRealm

AnimeRealm is a responsive anime discovery and streaming interface built with React, Vite, Tailwind CSS, React Router, Supabase, Artplayer, and HLS.js. It gives viewers a fast path from discovery to playback while keeping provider-specific response formats inside a small adapter layer.

The public catalog and playback pipeline use the documented [Kenjitsu API](https://kenjitsu-docs.vercel.app/). AniList-backed metadata and discovery requests are routed through Kenjitsu, while AniBD provides provider episode identifiers and HLS sources. AnimeRealm does not host or redistribute third-party media; streams are requested from external providers at playback time.

## Features

- **Discovery:** spotlight, trending, popular, upcoming, seasonal, genre, category, A–Z, producer, and airing-schedule views.
- **Search:** AniBD search results with URL-backed queries, autocomplete suggestions, normalized cards, and graceful empty states.
- **Anime details:** title variants, poster and banner art, synopsis, score, format, date, status, studio, genres, episodes, characters, and voice actors.
- **Playback:** HLS playback through Artplayer and HLS.js, subtitle-track support, language selection, download/source metadata, intro/outro controls, autoplay, auto-next, progress saving, and source fallback.
- **Personal features:** optional Supabase authentication, watchlists, continue-watching records, profiles, and notifications.
- **Responsive UI:** cinematic dark-first visual design, light-theme support, mobile navigation, keyboard focus states, reduced-motion support, and adaptive card grids.
- **Progressive web app:** Vite PWA generation is enabled for production builds.

## Quick start

### Prerequisites

Use Node.js 18 or newer and pnpm. A Supabase project is optional for public browsing and playback, but required for authentication and user-specific persistence.

### Install and configure

```bash
git clone https://github.com/Manvith911/AnimeRealm.git
cd AnimeRealm
pnpm install
cp .env.example .env
```

The default environment template points to the public Kenjitsu deployment. Edit `.env` when using another deployment or an m3u8 proxy.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_KENJITSU_API_URL` | No | Kenjitsu origin; defaults to `https://kenjitsu.koyeb.app`. |
| `VITE_ANIME_PROVIDER` | No | Playback provider namespace; defaults to `anibd`. |
| `VITE_M3U8_PROXY_URL` | No | Proxy URL for HLS hosts that require CORS or Referer handling. |
| `VITE_SUPABASE_URL` | No | Supabase project URL for auth and persistence. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No | Supabase browser-safe publishable/anon key. |

When both Supabase variables are empty, the public site remains usable and auth-backed controls return a clear unavailable state instead of crashing the application.

### Run locally

```bash
pnpm run dev       # Start Vite on localhost
pnpm run host      # Start Vite with network access
pnpm run lint      # Run ESLint
pnpm run build     # Create the production build and service worker
pnpm run preview   # Preview the production build
```

## API integration

All application requests are built through `src/config/api.js` and normalized before reaching components. The adapter layer keeps AniList metadata separate from AniBD playback identifiers.

| Capability | Kenjitsu route | Client responsibility |
| --- | --- | --- |
| AniBD search | `GET /api/anibd/anime/search?q={query}` | Normalize flat `data[]` search results. |
| AniBD detail | `GET /api/anibd/anime/{id}` | Read provider metadata and embedded provider episodes. |
| AniBD episodes | `GET /api/anibd/anime/{id}/episodes` | Use the provider ID and fall back to embedded detail episodes when necessary. |
| AniBD sources | `GET /api/anibd/sources/{episodeId}?version=sub\|dub\|raw` | Select the language version and normalize HLS URLs, headers, subtitles, and markers. |
| AniList detail/search | `GET /api/anilist/anime/{id}` and `GET /api/anilist/anime/search?q={query}` | Provide metadata, discovery, and AniList IDs. |
| AniList mappings | `GET /api/anilist/anime/{id}/mappings?provider=anibd` | Resolve an AniList ID to an AniBD provider ID before playback. |
| AniList characters | `GET /api/anilist/anime/{id}/characters` | Populate character and voice-actor views. |
| AniList schedule | `GET /api/anilist/airing/date/{date}` | Populate date-based airing cards and schedule pages. |

The API documentation is available at [kenjitsu-docs.vercel.app](https://kenjitsu-docs.vercel.app/), with provider-specific details in the [AniBD reference](https://kenjitsu-docs.vercel.app/anime/anibd) and metadata details in the [AniList reference](https://kenjitsu-docs.vercel.app/meta/anilist). Kenjitsu documents GET-based public routes and notes that provider streams may require a proxy when browsers encounter CORS or Referer restrictions.

## Project structure

```text
src/
├── components/       Reusable UI, cards, navigation, player, and shadcn primitives
├── config/           Runtime API and website configuration
├── context/          Theme, language, search, and home data contexts
├── hooks/            Auth, search, watch, notification, and control hooks
├── integrations/     Optional Supabase browser client and generated types
├── pages/            Route-level screens
└── utils/            Kenjitsu request adapters and response normalizers
```

The main integration files are:

| File | Responsibility |
| --- | --- |
| `src/config/api.js` | Kenjitsu base URL and provider route builders. |
| `src/utils/getHomeInfo.utils.js` | Home sections from AniList discovery endpoints. |
| `src/utils/getSearch.utils.js` | AniBD search normalization. |
| `src/utils/getAnimeInfo.utils.js` | AniList/AniBD ID resolution and detail normalization. |
| `src/utils/getEpisodes.utils.js` | Provider episode normalization. |
| `src/utils/getStreamInfo.utils.js` | Source, subtitle, header, and marker normalization. |
| `src/hooks/useWatchMultiSource.js` | Episode, language, source, and fallback state. |
| `src/components/player/Player.jsx` | Artplayer/HLS playback and progress handling. |

## Supabase setup

Supabase is only needed for user accounts and persisted personal features. When configured, run the SQL migration in `supabase/migrations/20260729000000_initial_schema.sql` in the Supabase SQL editor, then enable the desired authentication providers in the Supabase dashboard.

The application uses the following tables:

- `profiles` for username and avatar metadata.
- `watchlists` for saved titles and watch status.
- `continue_watching` for episode and playback progress.
- `notifications` for episode-release notices.

## Deployment

AnimeRealm is a static Vite application and can be deployed to Vercel or another static-hosting provider. Configure the environment variables in the hosting dashboard, set the build command to `pnpm run build`, and publish the generated `dist` directory according to the platform’s Vite integration. Set `VITE_M3U8_PROXY_URL` when the selected provider requires a browser-side HLS proxy.

## Maintenance and validation

Before opening a pull request, run the following commands:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build
```

For endpoint changes, verify a known search query, AniList detail and mapping resolution, character response, airing-date response, AniBD episode retrieval, and a source request with `version=sub`. Public providers can rate-limit or temporarily reject individual requests; UI adapters should preserve loading, empty, and recoverable error states rather than treating transient failures as permanent catalog deletions.

## License

MIT
