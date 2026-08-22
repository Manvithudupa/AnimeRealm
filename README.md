# AnimeRealm

AnimeRealm is a responsive anime discovery and streaming interface built with React, Vite, Tailwind CSS, React Router, Supabase, Artplayer, and HLS.js. It takes users from discovery to playback while keeping catalog metadata and provider-specific playback concerns separate.

**AniList is the single source of truth for catalog data.** Search, suggestions, home sections, categories, filters, schedules, anime details, recommendations, characters, voice actors, posters, descriptions, scores, and episode metadata are loaded from AniList through the documented Kenjitsu API. Playback uses the available Kenjitsu streaming providers and automatically falls through to the next provider or source when the current one is unavailable. AnimeRealm does not host or redistribute third-party media; playback URLs are requested from external providers at runtime.

## Features

- **AniList discovery:** trending, airing, popular, upcoming, seasonal, rating, genre, category, producer, A–Z, search, and airing-schedule views.
- **AniList metadata:** title variants, artwork, synopsis, score, format, dates, status, studios, genres, related anime, characters, and voice actors.
- **Playback failover:** ordered AniBD, AniDB, Anikoto, Animeheaven, and Anizone provider options, language-aware source selection, same-provider source fallback, and cross-provider failover.
- **HLS playback:** Artplayer and HLS.js with subtitle tracks, quality selection, optional proxy support, intro/outro controls, autoplay, auto-next, progress saving, and downloads when a direct source is available.
- **Personal features:** optional Supabase authentication, watchlists, continue-watching records, profiles, and notifications.
- **Responsive UI:** cinematic dark-first design, light-theme support, mobile navigation, keyboard focus states, reduced-motion support, and adaptive card grids.
- **Progressive web app:** Vite PWA generation is enabled for production builds.

## Quick start

### Prerequisites

Use Node.js 18 or newer and pnpm. A Supabase project is optional for public browsing and playback, but it is required for authentication and user-specific persistence.

### Install and configure

```bash
git clone https://github.com/Manvith911/AnimeRealm.git
cd AnimeRealm
pnpm install
cp .env.example .env
```

The default environment template points to the public Kenjitsu deployment. Edit `.env` when using another Kenjitsu deployment or an HLS proxy.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_KENJITSU_API_URL` | No | Kenjitsu origin; defaults to `https://kenjitsu.koyeb.app`. |
| `VITE_ANIME_PROVIDER` | No | Preferred first playback provider; defaults to `anibd`. The app falls through to the other supported providers automatically. |
| `VITE_M3U8_PROXY_URL` | No | Proxy URL for HLS hosts that require CORS or Referer handling. |
| `VITE_SUPABASE_URL` | No | Supabase project URL for auth and persistence. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No | Supabase browser-safe publishable/anon key. |

When both Supabase variables are empty, public browsing and playback remain usable. Auth-backed controls show an unavailable or login state instead of crashing the application.

### Run locally

```bash
pnpm run dev       # Start Vite on localhost
pnpm run host      # Start Vite with network access
pnpm run lint      # Run ESLint
pnpm run build     # Create the production build and service worker
pnpm run preview   # Preview the production build
```

## API integration

All application requests are built through `src/config/api.js` and normalized before reaching components. AniList requests are used for all visible catalog and metadata data. Provider requests are isolated to playback ID resolution, provider episode identifiers, and streaming source retrieval.

### AniList catalog and metadata

| Capability | Kenjitsu route | Client responsibility |
| --- | --- | --- |
| Search | `GET /api/anilist/anime/search?q={query}&page={page}&perPage={perPage}` | Normalize AniList results into AnimeRealm card models. |
| Top and popular lists | `GET /api/anilist/anime/top/{airing\|trending\|upcoming\|rating\|popular}` | Populate discovery sections and categories. |
| Seasonal lists | `GET /api/anilist/seasons/{season}/{year}` | Populate seasonal and filter views. |
| Anime detail | `GET /api/anilist/anime/{anilistId}` | Provide canonical metadata and artwork. |
| Episode metadata | `GET /api/anilist/anime/{anilistId}/episodes` | Provide canonical episode numbers, titles, artwork, and air dates. |
| Related anime | `GET /api/anilist/anime/{anilistId}/related` | Populate related and recommendation cards. |
| Characters | `GET /api/anilist/anime/{anilistId}/characters` | Populate character and voice-actor views. |
| Airing schedule | `GET /api/anilist/airing/date/{date}` | Populate date-based airing cards and schedule pages. |

### Playback providers

The watch page resolves the AniList ID into provider-specific identifiers through the mappings route and then hydrates provider episode IDs. Providers are tried in this order by default: **AniBD → AniDB → Anikoto → Animeheaven → Anizone**. The preferred provider can be changed with `VITE_ANIME_PROVIDER`, but the remaining providers remain available as fallbacks.

| Provider | Episode metadata | Sources |
| --- | --- | --- |
| AniBD | `GET /api/anibd/anime/{id}/episodes` or detail-embedded episodes | `GET /api/anibd/sources/{episodeId}?version=sub\|dub\|raw` |
| AniDB | `GET /api/anidb/anime/{id}/episodes` | `GET /api/anidb/sources/{episodeId}?version=sub\|dub\|raw` |
| Anikoto | Detail-embedded provider episodes | `GET /api/anikoto/sources/{episodeId}?version=sub\|dub\|raw&server={server}` |
| Animeheaven | `GET /api/animeheaven/anime/{id}/episodes` | `GET /api/animeheaven/sources/{episodeId}?version=sub\|dub\|raw` |
| Anizone | Detail-embedded provider episodes | `GET /api/anizone/sources/{episodeId}` |

The playback adapter normalizes source URLs, HLS type, quality, headers, subtitles, intro/outro markers, and provider labels. If a source fails inside the player, AnimeRealm first tries the next source from that provider and then advances to the next provider-language option. Transient provider errors are treated as recoverable playback failures rather than catalog failures.

The API documentation is available at [kenjitsu-docs.vercel.app](https://kenjitsu-docs.vercel.app/), with the [AniList reference](https://kenjitsu-docs.vercel.app/meta/anilist), [AniBD reference](https://kenjitsu-docs.vercel.app/anime/anibd), [AniDB reference](https://kenjitsu-docs.vercel.app/anime/anidb), [Anikoto reference](https://kenjitsu-docs.vercel.app/anime/anikoto), [Animeheaven reference](https://kenjitsu-docs.vercel.app/anime/animeheaven), and [Anizone reference](https://kenjitsu-docs.vercel.app/anime/anizone).

## Project structure

```text
src/
├── components/       Reusable UI, cards, navigation, player, and shadcn primitives
├── config/           Runtime API and website configuration
├── context/          Theme, language, search, and home data contexts
├── hooks/            Auth, search, watch, notification, and control hooks
├── integrations/     Optional Supabase browser client and generated types
├── pages/             Route-level screens
└── utils/             AniList adapters, provider playback adapters, and normalizers
```

The main integration files are:

| File | Responsibility |
| --- | --- |
| `src/config/api.js` | Kenjitsu base URL, AniList namespace, and ordered playback providers. |
| `src/utils/getHomeInfo.utils.js` | Home sections from AniList discovery endpoints. |
| `src/utils/getSearch.utils.js` | AniList search normalization. |
| `src/utils/getAnimeInfo.utils.js` | AniList detail, episode metadata, and related-anime normalization. |
| `src/utils/getEpisodes.utils.js` | AniList episode metadata normalization. |
| `src/utils/streamingProviders.utils.js` | Provider ID resolution, episode hydration, source normalization, and playback failover primitives. |
| `src/hooks/useWatchMultiSource.js` | AniList episode merge, provider-language choices, source state, and failover orchestration. |
| `src/components/player/Player.jsx` | Artplayer/HLS playback, error detection, and fallback callbacks. |

## Supabase setup

Supabase is only needed for user accounts and persisted personal features. When configured, run the SQL migration in `supabase/migrations/20260729000000_initial_schema.sql` in the Supabase SQL editor, then enable the desired authentication providers in the Supabase dashboard.

The application uses the following tables:

- `profiles` for username and avatar metadata.
- `watchlists` for saved titles and watch status.
- `continue_watching` for episode and playback progress.
- `notifications` for episode-release notices.

## Deployment

AnimeRealm is a static Vite application and can be deployed to Vercel or another static-hosting provider. Configure the environment variables in the hosting dashboard, set the build command to `pnpm run build`, and publish the generated `dist` directory according to the platform’s Vite integration. Set `VITE_M3U8_PROXY_URL` when a provider requires a browser-side HLS proxy.

## Maintenance and validation

Before opening a pull request, run:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build
```

For API changes, verify an AniList search query, AniList detail and episode metadata, related titles, characters, airing-date response, provider mapping resolution, provider episode retrieval, and a `version=sub` source request. To exercise failover, select each visible provider option and confirm that a source error invokes the next source or provider without losing the current episode. Public services can rate-limit or temporarily reject individual requests; the UI should preserve loading, empty, and recoverable playback error states.

## License

MIT
