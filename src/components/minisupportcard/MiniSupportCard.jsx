import { FaDiscord } from "react-icons/fa";

const MiniSupportCard = () => {
  return (
    <div className="mt-6 bg-[#1a1a1a] rounded-lg p-5 shadow-md flex flex-col gap-3">
      {/* Header */}
      <h3 className="text-white text-lg font-bold text-center">
        💖 Support & Join the Community
      </h3>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed text-center">
        Enjoying the site? Help us grow and make the community stronger!
      </p>

      {/* Key Actions */}
      <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
        <li>
          <span className="font-semibold text-white">Recommend the site</span> to friends.
        </li>
        <li>
          <span className="font-semibold text-white">Share your favorite episodes</span> online.
        </li>
        <li>
          <span className="font-semibold text-white">Give us feedback</span> to help improve the site experience.
        </li>
        <li>
          <span className="font-semibold text-white">Use the site regularly</span> — every visit supports us and keeps the community alive.
        </li>
        <li>
          <span className="font-semibold text-white">Tell more people about the site</span> and help us grow the anime community!
        </li>
        <li>
          <span className="font-semibold text-white">We have not put up ads</span> just for you to have a good/nice experience.
        </li>
        <li>
          <span className="font-semibold text-white">Join our Discord</span> to connect with other anime fans!
        </li>
      </ul>

      {/* Discord Button */}
      <div className="flex justify-center mt-2">
        <a
          href="https://discord.gg/Ax2c4ZgSkh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FaDiscord className="w-4 h-4" />
          Join Discord
        </a>
      </div>

      {/* Contact Email */}
      <p className="text-gray-300 text-sm text-center mt-2">
        Contact me at:{" "}
        <a
          href="mailto:manvithudupa073@gmail.com"
          className="text-indigo-400 hover:underline"
        >
          manvithudupa073@gmail.com
        </a>
      </p>
      {/* Call to Action */}
      <p className="text-gray-300 text-sm font-medium text-center mt-2">
        Every recommendation, share, Discord join, and feedback helps the site grow. Thank you for supporting the anime community!
      </p>
    </div>
  );
};

export default MiniSupportCard;
