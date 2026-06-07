import {
  faClosedCaptioning,
  faFile,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import "./Servers.css";
import { useEffect } from "react";

function Servers({
  servers,
  activeEpisodeNum,
  activeServerId,
  setActiveServerId,
  serverLoading,
  setActiveServerType,
  setActiveServerName,
}) {
  const subServers =
    servers?.filter((server) => server.type === "sub") || [];
  const dubServers =
    servers?.filter((server) => server.type === "dub") || [];
  const rawServers =
    servers?.filter((server) => server.type === "raw") || [];

  useEffect(() => {
    const savedServerName = localStorage.getItem("server_name");
    if (savedServerName) {
      const matchingServer = servers?.find(
        (server) => server.serverName === savedServerName,
      );

      if (matchingServer) {
        setActiveServerId(matchingServer.data_id);
        setActiveServerType(matchingServer.type);
      } else if (servers && servers.length > 0) {
        setActiveServerId(servers[0].data_id);
        setActiveServerType(servers[0].type);
      }
    } else if (servers && servers.length > 0) {
      setActiveServerId(servers[0].data_id);
      setActiveServerType(servers[0].type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servers]);

  const handleServerSelect = (server) => {
    setActiveServerId(server.data_id);
    setActiveServerType(server.type);
    setActiveServerName(server.serverName);
    localStorage.setItem("server_name", server.serverName);
    localStorage.setItem("server_type", server.type);
  };

  return (
    <div className="relative bg-black w-full min-h-[80px] flex justify-center items-center">
      {serverLoading ? (
        <div className="w-full h-full rounded-xl flex justify-center items-center">
          <BouncingLoader />
        </div>
      ) : servers ? (
        <div className="w-full h-full rounded-xl grid grid-cols-[minmax(0,30%),minmax(0,70%)] overflow-hidden border border-white/5 max-[800px]:grid-cols-[minmax(0,40%),minmax(0,60%)] max-[600px]:flex max-[600px]:flex-col max-[600px]:gap-0">
          <div className="h-full bg-white/5 px-6 text-white flex flex-col justify-center items-center gap-y-1 max-[600px]:bg-transparent max-[600px]:h-auto max-[600px]:py-3 max-[600px]:px-2">
            <p className="text-center leading-5 font-black uppercase tracking-widest text-[11px] text-white/40">
              Watching:{" "}
              <br className="max-[600px]:hidden" />
              <span className="text-[#eb3349] block mt-1">
                Episode {activeEpisodeNum}
              </span>
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-sm flex flex-col p-4 gap-4">
            {rawServers.length > 0 && (
              <div className={`servers px-2 flex items-center flex-wrap gap-y-1 ml-2 max-[600px]:py-1.5 max-[600px]:px-1 max-[600px]:ml-0 ${
                dubServers.length === 0 || subServers.length === 0
                  ? "h-1/2"
                  : "h-full"
              }`}>
                <div className="flex items-center gap-x-2 min-w-[65px]">
                  <FontAwesomeIcon
                    icon={faFile}
                    className="text-gray-500 dark:text-[#e0e0e0] text-[13px]"
                  />
                  <p className="font-bold text-[14px] max-[600px]:text-[12px]">RAW:</p>
                </div>
                <div className="flex gap-1.5 ml-2 flex-wrap max-[600px]:ml-0">
                  {rawServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-5 py-2 rounded-full cursor-pointer transition-all duration-300 font-bold ${
                        activeServerId === item?.data_id
                          ? "bg-[#eb3349] text-white shadow-lg shadow-red-900/20 scale-105"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[11px] uppercase tracking-wider">
                        {item.serverName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {subServers.length > 0 && (
              <div className={`servers px-2 flex items-center flex-wrap gap-y-1 ml-2 max-[600px]:py-1.5 max-[600px]:px-1 max-[600px]:ml-0 ${
                dubServers.length === 0 ? "h-1/2" : "h-full"
              }`}>
                <div className="flex items-center gap-x-2 min-w-[65px]">
                  <FontAwesomeIcon
                    icon={faClosedCaptioning}
                    className="text-gray-500 dark:text-[#e0e0e0] text-[13px]"
                  />
                  <p className="font-bold text-[14px] max-[600px]:text-[12px]">SUB:</p>
                </div>
                <div className="flex gap-1.5 ml-2 flex-wrap max-[600px]:ml-0">
                  {subServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-5 py-2 rounded-full cursor-pointer transition-all duration-300 font-bold ${
                        activeServerId === item?.data_id
                          ? "bg-[#eb3349] text-white shadow-lg shadow-red-900/20 scale-105"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[11px] uppercase tracking-wider">
                        {item.serverName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {dubServers.length > 0 && (
              <div className={`servers px-2 flex items-center flex-wrap gap-y-1 ml-2 max-[600px]:py-1.5 max-[600px]:px-1 max-[600px]:ml-0 ${
                subServers.length === 0 ? "h-1/2" : "h-full"
              }`}>
                <div className="flex items-center gap-x-2 min-w-[65px]">
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="text-gray-500 dark:text-[#e0e0e0] text-[13px]"
                  />
                  <p className="font-bold text-[14px] max-[600px]:text-[12px]">DUB:</p>
                </div>
                <div className="flex gap-1.5 ml-2 flex-wrap max-[600px]:ml-0">
                  {dubServers.map((item, index) => (
                    <div
                      key={index}
                      className={`px-5 py-2 rounded-full cursor-pointer transition-all duration-300 font-bold ${
                        activeServerId === item?.data_id
                          ? "bg-[#eb3349] text-white shadow-lg shadow-red-900/20 scale-105"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => handleServerSelect(item)}
                    >
                      <p className="text-[11px] uppercase tracking-wider">
                        {item.serverName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center font-medium text-[15px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          Could not load servers <br />
          Either reload or try again after sometime
        </p>
      )}
    </div>
  );
}

export default Servers;
