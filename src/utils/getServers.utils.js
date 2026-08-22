/**
 * AniBD does not expose a server-list route. Its source endpoint accepts a
 * language version (`sub`, `dub`, or `raw`) instead, so the watch hook builds
 * language choices directly from episode capabilities.
 */
export default async function getServers() {
  return {
    servers: [{ data_id: "sub", serverId: "sub", serverName: "SUB", type: "sub" }],
    downloadOptions: { sub: [], dub: [], raw: [] },
  };
}
