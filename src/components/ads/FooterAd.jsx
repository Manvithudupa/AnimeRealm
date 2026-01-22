import { useEffect, useRef } from "react";

const FooterAd = ({ adKey = "0af8c47b6fd1ac249856759804efa5a4" }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";

    // Set ad options
    window.atOptions = {
      key: adKey,
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    script.async = true;

    adRef.current.appendChild(script);
  }, [adKey]);

  return (
    <div
      ref={adRef}
      className="w-full flex justify-center my-4"
      style={{ minHeight: "90px" }}
    >
      Loading Ad…
    </div>
  );
};

export default FooterAd;
