import axios from "axios";
import { apiUrl, PROVIDER_LABELS, STREAMING_PROVIDERS } from "@/src/config/api";

const REQUEST_TIMEOUT_MS = 18000;

function asPayload(response) {
  return response?.data || {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstProviderId(payload) {
  const provider = payload?.data?.provider;
  const data = payload?.data;
  return provider?.id || data?.providerId || data?.id || payload?.providerId || null;
}

function normalizeEpisode(provider, episode = {}, index = 0) {
  const rawNumber = episode.episodeNumber ?? episode.episode_no ?? episode.number ?? episode.episode ?? index + 1;
  const episodeNumber = Number(rawNumber) || index + 1;
  const id = episode.episodeId || episode.id || episode.url || `${episodeNumber}`;
  const languageInfo = episode.episodes || episode.language || {};
  const hasSub = episode.hasSub ?? episode.sub ?? languageInfo.sub ?? true;
  const hasDub = episode.hasDub ?? episode.dub ?? languageInfo.dub ?? false;

  return {
    provider,
    providerLabel: PROVIDER_LABELS[provider] || provider,
    providerEpisodeId: String(id),
    episodeId: String(id),
    id: `ep=${episodeNumber}`,
    episode_no: episodeNumber,
    title: episode.title || `Episode ${episodeNumber}`,
    thumbnail: episode.thumbnail || episode.image || null,
    overview: episode.overview || episode.synopsis || null,
    airDate: episode.airDate || episode.releaseDate || null,
    aired: episode.aired !== false,
    hasSub: hasSub !== false && hasSub !== null,
    hasDub: Boolean(hasDub),
    isFiller: Boolean(episode.isFiller || episode.filler),
  };
}

function normalizeEpisodeList(provider, payload) {
  const items = asArray(payload?.data || payload?.episodes || payload);
  return items
    .map((episode, index) => normalizeEpisode(provider, episode, index))
    .filter((episode, index, all) => all.findIndex((item) => item.episode_no === episode.episode_no) === index)
    .sort((a, b) => a.episode_no - b.episode_no);
}

function normalizeSource(provider, source = {}, index = 0) {
  const url = source.url || source.file || source.src || source.link || source.m3u8 || "";
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return {
    url,
    isM3u8: Boolean(source.m3u8) || String(source.type || "").toLowerCase().includes("m3u8") || /\.m3u8(?:\?|$)/i.test(url),
    type: source.type || "hls",
    quality: source.quality || source.resolution || "auto",
    referer: source.referer || source.headers?.Referer || source.headers?.referer || null,
    provider,
    providerLabel: PROVIDER_LABELS[provider] || provider,
    server: source.server || source.name || `Source ${index + 1}`,
  };
}

function normalizeStream(provider, payload) {
  const data = payload?.data || payload || {};
  const sources = asArray(data.sources || data.source || data.links)
    .map((source, index) => normalizeSource(provider, source, index))
    .filter(Boolean);
  const tracks = asArray(data.tracks || data.subtitles || data.captions)
    .map((track) => ({
      file: track.file || track.url || track.src,
      label: track.label || track.language || "English",
      kind: track.kind || "captions",
      default: Boolean(track.default),
    }))
    .filter((track) => track.file);
  const primary = sources[0];

  return {
    provider,
    providerLabel: PROVIDER_LABELS[provider] || provider,
    sources,
    headers: data.headers || (primary?.referer ? { Referer: primary.referer } : {}),
    subtitles: tracks,
    intro: data.intro || data.introChapter || null,
    outro: data.outro || data.outroChapter || null,
    thumbnail: data.thumbnail || null,
  };
}

async function request(url, config = {}) {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT_MS,
    ...config,
  });
  return asPayload(response);
}

export async function resolveProviderId(anilistId, provider, title = "") {
  if (!anilistId || !provider) return null;

  try {
    const mapping = await request(apiUrl(`/anime/${anilistId}/mappings?provider=${encodeURIComponent(provider)}`, "anilist"));
    const mappedId = firstProviderId(mapping);
    if (mappedId && String(mappedId) !== String(anilistId)) return String(mappedId);
  } catch (error) {
    console.warn(`AniList mapping failed for ${provider}:`, error?.message || error);
  }

  if (!title) return null;

  try {
    const search = await request(apiUrl(`/anime/search?q=${encodeURIComponent(title)}`, provider));
    const items = asArray(search.data);
    const exact = items.find((item) => String(item.anilistId || "") === String(anilistId));
    return String(exact?.id || items[0]?.id || "") || null;
  } catch (error) {
    console.warn(`${provider} title fallback failed:`, error?.message || error);
    return null;
  }
}

export async function fetchProviderEpisodes(provider, providerId, embeddedEpisodes = []) {
  if (!provider || !providerId) return [];

  try {
    const payload = await request(apiUrl(`/anime/${encodeURIComponent(providerId)}/episodes`, provider));
    const episodes = normalizeEpisodeList(provider, payload);
    if (episodes.length) return episodes;
  } catch (error) {
    console.warn(`${provider} episode request failed:`, error?.message || error);
  }

  const embedded = normalizeEpisodeList(provider, { data: embeddedEpisodes });
  if (embedded.length) return embedded;

  try {
    const detailPayload = await request(apiUrl(`/anime/${encodeURIComponent(providerId)}`, provider));
    return normalizeEpisodeList(provider, {
      data: detailPayload?.providerEpisodes || detailPayload?.data?.providerEpisodes || [],
    });
  } catch (error) {
    console.warn(`${provider} detail fallback failed:`, error?.message || error);
    return [];
  }
}

export async function fetchProviderSources(provider, episodeId, version = "sub", server = null) {
  if (!provider || !episodeId) throw new Error("Missing provider or episode ID");

  const params = { version };
  if (server && ["anikoto"].includes(provider)) params.server = server;
  const payload = await request(apiUrl(`/sources/${encodeURIComponent(episodeId)}`, provider), { params });
  const normalized = normalizeStream(provider, payload);
  if (!normalized.sources.length) throw new Error(`${PROVIDER_LABELS[provider] || provider} returned no playable sources`);
  return normalized;
}

export async function buildProviderOptions(anilistId, title, preferredProvider = "anibd") {
  const orderedProviders = [preferredProvider, ...STREAMING_PROVIDERS].filter(
    (provider, index, all) => STREAMING_PROVIDERS.includes(provider) && all.indexOf(provider) === index
  );
  const resolved = await Promise.all(
    orderedProviders.map(async (provider) => ({
      provider,
      providerId: await resolveProviderId(anilistId, provider, title),
    }))
  );
  return resolved.filter((item) => item.providerId);
}

export { normalizeEpisode, normalizeEpisodeList, normalizeStream };
