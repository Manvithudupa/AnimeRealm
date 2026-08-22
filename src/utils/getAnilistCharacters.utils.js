import axios from "axios";
import { apiUrl } from "@/src/config/api";

function parseNumericId(value) {
  const text = String(value || "").trim();
  return /^\d+$/.test(text) ? text : null;
}

async function resolveAniListId(id, title) {
  const direct = parseNumericId(id);
  if (direct) return direct;
  if (!title && !id) return null;
  const response = await axios.get(apiUrl("/anime/search", "anilist"), { params: { q: title || id, page: 1, perPage: 1 } });
  return response.data?.data?.[0]?.id || null;
}

export default async function getAnilistCharacters(anilistId, animeTitle) {
  try {
    const numericId = await resolveAniListId(anilistId, animeTitle);
    if (!numericId) return [];
    const response = await axios.get(apiUrl(`/anime/${numericId}/characters`, "anilist"));
    const characters = response.data?.data?.characters || [];
    return characters.map((character) => ({
      id: character.id,
      name: character.name || "",
      image: character.image || null,
      role: character.role || "BACKGROUND",
      voiceActors: (character.voiceActors || []).map((actor) => ({
        id: actor.id,
        name: actor.name || "",
        image: actor.image || null,
        language: actor.language || "Unknown",
      })),
    }));
  } catch (error) {
    console.warn("Kenjitsu character request failed:", error?.message || error);
    return [];
  }
}
