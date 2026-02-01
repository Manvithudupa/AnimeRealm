import React from "react";

const MiniSupportCard = () => {
  return (
    <div className="mt-6 bg-[#1a1a1a] rounded-lg p-6 shadow-md flex flex-col gap-4">
      {/* Header */}
      <h3 className="text-white text-lg font-bold text-center">
        Support & Join the Community
      </h3>

      {/* Main Description */}
      <p className="text-gray-300 text-sm leading-relaxed text-center">
        Love our site and the anime content we provide? You can help us grow
        and make the community even better!
      </p>

      {/* Guidance / Instructions */}
      <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
        <li>Recommend the site to your friends who love anime.</li>
        <li>Share your favorite episodes and updates on social media.</li>
        <li>Provide feedback so we can improve the site experience.</li>
        <li>Join our Discord to chat, discuss, and connect with other anime fans!</li>
        <li>Spread the word and help more people enjoy anime for free!</li>
        <li>Simply using the site regularly helps support us too!</li>
      </ul>

      {/* Discord Button */}
      <div className="flex justify-center mt-2">
        <a
          href="https://discord.gg/be774snHsP"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Join Discord
        </a>
      </div>

      {/* Call to Action */}
      <p className="text-gray-300 text-sm font-medium text-center mt-2">
        Every recommendation, share, and community join helps us grow. Thank
        you for supporting our site and sharing the love of anime!
      </p>
    </div>
  );
};

export default MiniSupportCard;
