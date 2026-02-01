import React from "react";

const MiniSupportCard = () => {
  return (
    <div className="mt-6 bg-[#1a1a1a] rounded-lg p-5 shadow-md flex flex-col gap-3">
      {/* Header */}
      <h3 className="text-white text-lg font-semibold text-center">
        Support & Join the Community
      </h3>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed text-center">
        Love our site? Help us grow by supporting and sharing it with others!
      </p>

      {/* Instructions */}
      <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
        <li>Recommend the site to friends who love anime.</li>
        <li>Share your favorite anime episodes and updates.</li>
        <li>Give feedback to help us improve the site.</li>
        <li>Join our Discord to chat, discuss, and be part of the community!</li>
      </ul>

      {/* Discord Button */}
      <div className="flex justify-center mt-2">
        <a
          href="https://discord.gg/be774snHsP"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Join Discord
        </a>
      </div>

      {/* Call to Action */}
      <p className="text-gray-300 text-sm font-medium text-center mt-2">
        Every share, recommendation, and community join helps us grow — thank you for your support!
      </p>
    </div>
  );
};

export default MiniSupportCard;
