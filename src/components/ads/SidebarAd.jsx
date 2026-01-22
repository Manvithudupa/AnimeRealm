import { useEffect, useRef } from "react";

const SidebarAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Prevent duplicate ads on re-render
    adRef.current.innerHTML = "";

    // Define ad options
    window.atOptions = {
      key: "905d4aa3130f8b2e32194ead18c4412d",
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };

    // Create script
    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/905d4aa3130f8b2e32194ead18c4412d/invoke.js";
    script.async = true;

    adRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center mt-6">
      <div
        ref={adRef}
        className="w-[300px] h-[250px] bg-[#1f1f2e] flex items-center justify-center text-sm text-gray-400"
      >
        Loading Ad…
      </div>
    </div>
  );
};

export default SidebarAd;
