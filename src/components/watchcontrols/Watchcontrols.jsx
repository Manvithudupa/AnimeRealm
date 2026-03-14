import { faBackward, faForward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useTheme } from "@/src/context/ThemeContext";

const ToggleButton = ({ label, isActive, onClick, isDark }) => (
  <button 
    className={`flex items-center text-xs px-2 py-0.5 rounded transition-colors ${isDark ? "hover:bg-[#2a2a2a]" : "hover:bg-black/10"}`}
    onClick={onClick}
  >
    <span className={isDark ? "text-gray-300" : "text-gray-600"}>{label}</span>
    <span
      className={`ml-1.5 ${
        isActive
          ? isDark ? "text-white" : "text-gray-900"
          : isDark ? "text-gray-500" : "text-gray-400"
      }`}
    >
      {isActive ? "ON" : "OFF"}
    </span>
  </button>
);

export default function WatchControls({
  autoPlay,
  setAutoPlay,
  autoSkipIntro,
  setAutoSkipIntro,
  autoNext,
  setAutoNext,
  hardSub,
  setHardSub,
  episodeId,
  episodes = [],
  onButtonClick,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  return (
    <div className={`w-full flex justify-between items-center px-3 py-2 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <div className="flex gap-x-2">
        <ToggleButton
          label="Auto Play"
          isActive={autoPlay}
          onClick={() => setAutoPlay((prev) => !prev)}
          isDark={isDark}
        />
        <ToggleButton
          label="Skip Intro/Outro"
          isActive={autoSkipIntro}
          onClick={() => setAutoSkipIntro((prev) => !prev)}
          isDark={isDark}
        />
        <ToggleButton
          label="Auto Next"
          isActive={autoNext}
          onClick={() => setAutoNext((prev) => !prev)}
          isDark={isDark}
        />
        <ToggleButton
          label="Hard Sub"
          isActive={hardSub}
          onClick={() => setHardSub((prev) => !prev)}
          isDark={isDark}
        />
      </div>
      <div className="flex items-center gap-x-2">
        <button
          onClick={() => {
            if (currentEpisodeIndex > 0) {
              onButtonClick(
                episodes[currentEpisodeIndex - 1].id.match(/ep=(\d+)/)?.[1]
              );
            }
          }}
          disabled={currentEpisodeIndex <= 0}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            currentEpisodeIndex <= 0
              ? isDark ? "text-gray-600 cursor-not-allowed" : "text-gray-400 cursor-not-allowed"
              : isDark ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <FontAwesomeIcon icon={faBackward} className="text-[14px]" />
        </button>
        <button
          onClick={() => {
            if (currentEpisodeIndex < episodes?.length - 1) {
              onButtonClick(
                episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
              );
            }
          }}
          disabled={currentEpisodeIndex >= episodes?.length - 1}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            currentEpisodeIndex >= episodes?.length - 1
              ? isDark ? "text-gray-600 cursor-not-allowed" : "text-gray-400 cursor-not-allowed"
              : isDark ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <FontAwesomeIcon icon={faForward} className="text-[14px]" />
        </button>
      </div>
    </div>
  );
}
