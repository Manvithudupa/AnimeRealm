import { useEffect, useState } from "react";
import website_name from "@/src/config/website.js";

function SupportPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("supportPopupSeen");

    if (!seen) {
      setTimeout(() => {
        setShow(true);
      }, 2000); // show after 2 sec
    }
  }, []);

  const closePopup = () => {
    setShow(false);
    localStorage.setItem("supportPopupSeen", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

      <div className="bg-[#111] text-white rounded-xl max-w-md w-full p-6 shadow-2xl relative">

        {/* Close */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">
          💙 Support {website_name}
        </h2>

        {/* Text */}
        <p className="text-gray-300 text-center mb-4">
          We’re growing and need your support!
        </p>

        <div className="space-y-2 text-sm text-gray-200 text-center">
          <p>✅ Join our Discord</p>
          <p>✅ Share this site with friends</p>
          <p>✅ Help us grow together 🚀</p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">

          {/* Discord */}
          <a
            href="https://discord.gg/be774snHsP"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-indigo-600 hover:bg-indigo-700 transition rounded-lg py-2 font-semibold"
          >
            Join Discord 💬
          </a>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied! Share with friends ❤️");
            }}
            className="w-full bg-green-600 hover:bg-green-700 transition rounded-lg py-2 font-semibold"
          >
            Copy Site Link 🔗
          </button>

          {/* Later */}
          <button
            onClick={closePopup}
            className="text-gray-400 hover:text-white text-sm"
          >
            Maybe Later
          </button>

        </div>
      </div>
    </div>
  );
}

export default SupportPopup;
