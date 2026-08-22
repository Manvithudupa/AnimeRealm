import { fetchProviderSources } from "./streamingProviders.utils";

export default async function getStreamInfo(episodeId, version = "sub", provider = "anibd", server = null) {
  return fetchProviderSources(provider, episodeId, version, server);
}
