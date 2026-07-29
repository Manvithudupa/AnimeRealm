import axios from "axios";
import { apiUrl } from "@/src/config/api";

/**
 * Fetches episode servers from Shirayuki API.
 *
 * Actual response (live-tested):
 * {
 *   data: {
 *     servers: {
 *       sub: [ { name: "HD-1", nameId: "hd-1", embed: "...", tab: "tab_0" } ],
 *       dub: [ { name: "HD-1", nameId: "hd-1", embed: "...", tab: "tab_1" } ],
 *       hsub: []
 *     }
 *   }
 * }
 *
 * @param {string} animeEpisodeId - In format "slug/ep-N" (e.g. "attack-on-titan/ep-1")
 */
export default async function getServers(animeEpisodeId) {
  try {
    const response = await axios.get(apiUrl('/episode/servers'), {
      params: { animeEpisodeId },
    });
    const data = response.data?.data || {};
    const serversData = data.servers || {};

    const servers = [];

    // Sub servers
    (serversData.sub || []).forEach((server, index) => {
      servers.push({
        serverId: server.nameId || server.name,
        serverName: server.name,
        displayName: server.name,
        type: "sub",
        data_id: server.nameId || server.name,
        server_id: `sub-${index}`,
        embed: server.embed || null,
      });
    });

    // Dub servers
    (serversData.dub || []).forEach((server, index) => {
      servers.push({
        serverId: server.nameId || server.name,
        serverName: server.name,
        displayName: server.name,
        type: "dub",
        data_id: server.nameId || server.name,
        server_id: `dub-${index}`,
        embed: server.embed || null,
      });
    });

    // Raw/hsub servers
    (serversData.hsub || []).forEach((server, index) => {
      servers.push({
        serverId: server.nameId || server.name,
        serverName: server.name,
        displayName: server.name,
        type: "raw",
        data_id: server.nameId || server.name,
        server_id: `raw-${index}`,
        embed: server.embed || null,
      });
    });

    const downloadOptions = {
      sub: (serversData.sub || []).map(s => ({ serverId: s.nameId, serverName: s.name })),
      dub: (serversData.dub || []).map(s => ({ serverId: s.nameId, serverName: s.name })),
      raw: (serversData.hsub || []).map(s => ({ serverId: s.nameId, serverName: s.name })),
      episodeNumber: data.episode || null,
    };

    return { servers, downloadOptions };
  } catch (error) {
    console.error("Error fetching servers:", error);
    return error;
  }
}
