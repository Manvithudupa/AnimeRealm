import React from "react";

const MiniSupportCard = () => {
  return (
    <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 flex flex-col gap-2 shadow-md text-center">
      {/* Title */}
      <h3 className="text-white text-sm font-semibold">Support / Community</h3>

      {/* Description */}
      <p className="text-gray-400 text-xs">
        Enjoying the site? Support us or join the community!
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-2 mt-2">
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 transition-colors"
        >
          Discord
        </a>
        <a
          href="https://www.patreon.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
        >
          Patreon
        </a>
      </div>
    </div>
  );
};

export default MiniSupportCard;
