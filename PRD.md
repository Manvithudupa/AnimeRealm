# AnimeRealm Product Requirements Document

**Author:** Manus AI  
**Status:** Updated for Kenjitsu API integration  
**Repository:** [Manvith911/AnimeRealm](https://github.com/Manvith911/AnimeRealm)  
**API documentation:** [Kenjitsu API documentation](https://kenjitsu-docs.vercel.app/)  
**Date:** 22 August 2026

## 1. Executive summary

AnimeRealm is a responsive anime discovery and streaming web application. It enables users to discover anime, search the catalog, inspect anime metadata, browse episodes, watch available streams, maintain a watchlist, resume partially watched titles, and receive episode-related notifications. The product uses Supabase for optional authentication and user-specific persistence, while the public anime data and playback pipeline are provided by Kenjitsu.

This PRD defines the intended product behavior and the updated API contract. The current implementation has been migrated from the retired Shirayuki v2/Hianime-shaped contract to Kenjitsu’s current provider routes. Kenjitsu supports GET requests only and identifies its service as unofficial and unaffiliated with third-party providers; AnimeRealm must preserve that disclaimer in user-facing documentation and avoid representing third-party media as hosted by the application.[1]

## 2. Product vision and goals

AnimeRealm should provide a fast, visually focused anime browsing experience that minimizes the distance between discovery and playback. A user should be able to search for a title, understand its basic metadata, choose an episode, select an available language, and begin playback without needing to understand provider-specific identifiers.

The updated integration has four primary goals. First, it must use the documented Kenjitsu AniBD routes for provider search, details, episodes, and sources. Second, it must use stable AniList identifiers for metadata features where AniList is the appropriate source. Third, it must preserve the existing UI data model so that watchlists, continue-watching records, episode navigation, and the player do not depend directly on provider response shapes. Fourth, it must fail gracefully when a provider has no episodes, sources, subtitles, or available language option.

| Goal | Success signal |
| --- | --- |
| Reliable discovery | Search returns normalized AnimeRealm cards from Kenjitsu AniBD. |
| Reliable playback | A valid provider episode ID produces one or more playable sources when available. |
| Stable user state | Watchlist and continue-watching records remain addressable after API response changes. |
| Provider isolation | Components consume normalized app models rather than raw Kenjitsu payloads. |
| Transparent limitations | Unsupported, unavailable, or blocked streams produce actionable empty/error states. |

## 3. Target users and primary use cases

The primary user is an anime viewer who wants to browse titles, inspect enough metadata to make a viewing decision, and start watching quickly. Secondary users include returning viewers who want to resume a title, users organizing a personal watchlist, and users checking airing information or episode availability.

The primary journey is: open AnimeRealm, browse or search, select a title, review synopsis and metadata, select an episode, select sub or dub when available, load a stream, and resume or continue to the next episode. A returning-user journey is: authenticate if desired, open the watchlist or continue-watching section, select a title, and resume at the stored episode.

## 4. Product scope

### In scope

AnimeRealm will provide public anime search and discovery, anime detail pages, episode lists, episode playback, subtitle-track presentation when supplied by the API, source fallback when multiple sources are returned, optional authentication, watchlists, continue-watching state, responsive layouts, and schedule-oriented views where the Kenjitsu AniList schedule endpoint supplies data.

### Out of scope

AnimeRealm will not host, store, transcode, or redistribute third-party video. It will not add non-GET mutations to Kenjitsu, implement payment or subscription functionality, guarantee availability of any external stream, or treat provider identifiers as permanent user-facing identifiers. Kenjitsu’s own documentation states that it only supports GET requests and that it does not host, own, or distribute content.[1]

## 5. Current product baseline

The repository is a Vite/React application with CSS and Tailwind-based styling, React Router navigation, reusable content cards, a watch page, a video player, watchlist and continue-watching flows, Supabase integrations, and local caching in browser storage. The most important user-facing surfaces are the home/discovery experience, search, anime detail, watch page, watchlist, profile/settings, and notifications.

The integration layer now centralizes the Kenjitsu base URL and provider namespaces in `src/config/api.js`. AniBD provider responses are normalized in the search, detail, episode, and stream utilities. The watch hook synthesizes language choices from episode capabilities because the current AniBD contract exposes `version=sub|dub|raw` on the sources endpoint rather than the retired server-list endpoint.

## 6. API integration requirements

Kenjitsu’s documented API is organized by provider namespace. AnimeRealm uses the `anibd` namespace for provider playback and the `anilist` namespace for metadata and discovery.[1] [2]

| Capability | HTTP method | Current endpoint | Required client behavior |
| --- | --- | --- | --- |
| AniBD search | GET | `/api/anibd/anime/search?q={query}` | Send a required `q`; normalize `data[]` and `currentPage`/`hasNextPage`. |
| AniBD detail | GET | `/api/anibd/anime/{id}` | Use AniBD provider ID; normalize `data` and embedded `providerEpisodes`. |
| AniBD episodes | GET | `/api/anibd/anime/{id}/episodes` | Use the provider ID; normalize `data[]` episode records. |
| AniBD sources | GET | `/api/anibd/sources/{episodeId}?version={version}` | Use `episodeId` from episode data; default `version` to `sub`. |
| AniList search | GET | `/api/anilist/anime/search?q={query}` | Use for metadata-oriented search or fallback discovery. |
| AniList detail | GET | `/api/anilist/anime/{id}` | Use numeric AniList ID for rich metadata. |
| AniList characters | GET | `/api/anilist/anime/{id}/characters` | Use numeric AniList ID for character and voice-actor views. |
| AniList mappings | GET | `/api/anilist/anime/{id}/mappings?provider=anibd` | Resolve provider-specific IDs when a user starts from an AniList ID. |
| AniList schedule | GET | `/api/anilist/airing/date/{date}?page={page}&perPage={perPage}` | Use ISO date strings and preserve pagination. |

The Kenjitsu AniBD documentation defines search, detail, episode, and source routes and specifies that the `version` query parameter accepts `sub`, `dub`, or `raw`, defaulting to `sub`.[2] The AniList documentation defines metadata, characters, schedule, mappings, and episode-related routes.[3]

## 7. Functional requirements

### Discovery and search

The application shall allow a user to enter an anime query and receive normalized result cards. Each card shall support a title, alternate title where available, poster image, format, AniList ID where available, and provider ID. Search must show loading, empty, and error states. The query must be URL-encoded, and the client must not assume that search responses contain the legacy nested `data.results` and `data.pagination` structure.

The home experience shall use supported Kenjitsu routes or display an intentional empty state when a previously available legacy aggregate route has no current equivalent. Unsupported categories must not silently issue requests to retired paths. Where possible, AniList top, seasonal, and schedule routes should provide discovery data while AniBD remains the playback provider.

### Anime details

The detail page shall show a title, alternate/native title, poster or banner image, synopsis, format, release date, studio, genres, episode count, and status when supplied. The detail adapter shall preserve an app-level model even when optional fields are absent. The provider episode list returned with AniBD detail data may be used to avoid a second request, but the dedicated episodes endpoint remains the source of truth for episode playback availability.

### Episodes and playback

The episode list shall display normalized episode number, title, provider episode ID, subtitle availability, and dub availability. The UI shall use the provider episode ID for source requests and must not reconstruct a legacy slug-based episode ID unless the API response is missing one.

For playback, the client shall call the sources endpoint with a language version. The client shall normalize returned source URLs, media type, quality, referer metadata, subtitle tracks, intro markers, outro markers, and thumbnails. If multiple sources are returned, the player shall attempt the first source and expose automatic or manual fallback behavior. If no source is returned, the user shall see a clear retry or language-selection message rather than a blank player.

### Watchlist and continue watching

Authenticated users shall be able to add and remove titles from a watchlist. The application shall persist a stable app identifier, title, poster, and provider/AniList identifiers as available. Continue-watching records shall store the current episode number and provider episode ID, allowing a user to resume playback without relying on the current ordering of the episode list.

### Schedule and notifications

Schedule views shall use the documented AniList airing-date or per-anime schedule endpoints where supported. Notifications may compare locally stored watch progress and watched-title identifiers against refreshed episode metadata. The notification pipeline shall tolerate unavailable provider episodes and avoid treating a transient API error as proof that no new episode exists.

## 8. Non-functional requirements

The application shall remain responsive on mobile and desktop layouts. API calls shall be cancellable or ignored after component unmount where practical, cached for short periods where appropriate, and protected from duplicate in-flight requests. Browser storage failures shall not prevent the rest of the application from operating.

The client shall keep API URLs configurable through environment variables, with a safe public default for local development. The expected variables are `VITE_KENJITSU_API_URL`, `VITE_ANIME_PROVIDER`, and the existing optional proxy and Supabase variables. No private key or privileged credential shall be placed in client-side environment variables.

Playback shall account for 403 and CORS failures. Kenjitsu documentation recommends an m3u8 proxy with a referer header when those failures occur.[1] The product shall explain this limitation in the error state or deployment documentation rather than retrying indefinitely.

## 9. Data contracts

The normalized search item should contain `id`, `data_id`, `anilistId`, `title`, `japanese_title`, `poster`, `bannerImage`, `tvInfo`, and optional descriptive fields. The normalized episode should contain `episodeId`, `id`, `episode_no`, `title`, `hasSub`, `hasDub`, and optional playback metadata. The normalized stream response should contain `sources`, `headers`, `subtitles`, `intro`, `outro`, and `thumbnail`.

The adapter layer must remain the only place that knows whether Kenjitsu returns a field as `name`, `title`, `posterImage`, `image`, `episodeNumber`, or `episodeId`. Components must not read raw response fields such as `providerEpisodes` directly unless the adapter deliberately exposes them as part of the app model.

## 10. Error, empty, and fallback behavior

| Condition | User-facing behavior |
| --- | --- |
| Search query missing | Keep the search control usable and prompt for a title. |
| Search returns no data | Show an empty result state with the query preserved. |
| Detail returns 404 or invalid data | Show a not-found state and a route back to discovery. |
| Episode list is empty | Explain that episodes are unavailable and avoid showing a broken player. |
| Sources are empty | Show retry and language-selection actions. |
| 403/CORS on media | Explain that an m3u8 proxy may be required. |
| One source fails | Move to the next normalized source when available. |
| All sources fail | Show a recoverable error and preserve episode context. |
| Optional auth/storage fails | Keep public browsing and playback available. |

## 11. Analytics and observability

The product should measure search submission, result selection, detail-page load success, episode selection, source request success, source fallback, playback start, playback error, watchlist mutation, and resume success. Logs must exclude full media URLs where those URLs may contain sensitive or short-lived query parameters. Error events should include endpoint category, HTTP status when known, provider, and app route.

## 12. Acceptance criteria

The migration is accepted when a user can search for a known title and see normalized results from `GET /api/anibd/anime/search`; open a valid result and see normalized metadata from `GET /api/anibd/anime/{id}`; load episodes from `GET /api/anibd/anime/{id}/episodes`; select an episode and language; request sources from `GET /api/anibd/sources/{episodeId}?version=sub|dub|raw`; and play the first available source or receive a clear recoverable error.

The migration is also accepted when the production build completes, lint reports no errors, legacy `/api/v2/{provider}` paths are no longer used by the migrated core flow, the app does not assume nested legacy response envelopes, watchlist and continue-watching state remain functional, and the environment example documents the Kenjitsu variables.

## 13. Implementation status

The current change updates the central API configuration, search adapter, anime detail adapter, episode adapter, stream adapter, shared watch backend helpers, watch hook language selection, schedule route, environment example, and missing `prop-types` build dependency. Direct ESLint validation completes with zero errors, and the Vite production build completes successfully. The remaining lint output is a non-blocking pre-existing warning for an unused suppression comment in `src/pages/watch/Watch.jsx`; it should be removed in a follow-up cleanup.

The legacy utility modules for advanced categories, producers, suggestions, and some home sections still require individual product decisions because the current Kenjitsu documentation does not expose direct equivalents for every former Shirayuki route. Those surfaces should either be migrated to documented AniList endpoints, intentionally marked unavailable, or removed from navigation rather than continuing to call retired paths.

## 14. References

[1]: https://kenjitsu-docs.vercel.app/ "Kenjitsu — Getting Started, supported methods, disclaimer, and 403/CORS guidance"

[2]: https://kenjitsu-docs.vercel.app/anime/anibd "Kenjitsu — AniBD endpoint documentation"

[3]: https://kenjitsu-docs.vercel.app/meta/anilist "Kenjitsu — AniList metadata endpoint documentation"

[4]: https://github.com/middlegear/kenjitsu "Kenjitsu source repository and current release context"
