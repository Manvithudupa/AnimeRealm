import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function Footer() {
  useEffect(() => {
    // Create Options Script
    const adOptions = document.createElement("script");
    adOptions.type = "text/javascript";
    adOptions.innerHTML = `
      atOptions = {
        'key' : '0af8c47b6fd1ac249856759804efa5a4',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    // Create Invoke Script
    const adInvoke = document.createElement("script");
    adInvoke.type = "text/javascript";
    adInvoke.src = "//www.highperformanceformat.com/0af8c47b6fd1ac249856759804efa5a4/invoke.js";
    adInvoke.async = true;

    document.getElementById("ad-container")?.appendChild(adOptions);
    document.getElementById("ad-container")?.appendChild(adInvoke);
  }, []);

  return (
    <footer className="w-full mt-16">
      
      {/* Logo Section */}
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex justify-center sm:justify-start items-center gap-6">
          <img
            src="/footer.png"
            alt={logoTitle}
            className="h-[100px] w-[200px] object-contain"
          />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 py-6">

          {/* 🔥 AD SCRIPT LOADS HERE */}
          <div id="ad-container" className="flex justify-center my-6"></div>

          {/* A-Z List Section */}
          <div className="mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 items-center sm:items-start">
              <h2 className="text-sm font-medium text-white">A-Z LIST</h2>
              <span className="text-sm text-white/60">Browse anime alphabetically</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {["All", "#", "0-9", ...Array.from({ length: 26 }, (_, i) =>
                String.fromCharCode(65 + i)
              )].map((item, index) => (
                <Link
                  to={`az-list/${item === "All" ? "" : item}`}
                  key={index}
                  className="px-2.5 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Footer Links */}
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start mt-4">
              <Link to="/terms-of-service" className="text-sm text-white/60 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/dmca" className="text-sm text-white/60 hover:text-white">
                DMCA
              </Link>
              <Link to="/contact" className="text-sm text-white/60 hover:text-white">
                Contact
              </Link>
            </div>
          </div>

          {/* Legal Text */}
          <div className="space-y-2 text-sm text-white/40 text-center sm:text-left">
            <p className="max-w-4xl mx-auto sm:mx-0">
              {website_name} does not host any files, it merely pulls streams from 3rd
              party services. Legal issues should be taken up with file hosts.
              {website_name} is not responsible for any media files shown.
            </p>
            <p>© {website_name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
