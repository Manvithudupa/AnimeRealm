import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full mt-20 bg-[#070707] border-t border-white/5">
      <div className="max-w-[1920px] mx-auto px-4 py-10">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">

          {/* Branding */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-xl font-bold text-white">
              {logoTitle || website_name}
            </h2>
            <p className="text-sm text-white/50 max-w-sm mx-auto lg:mx-0">
              Watch and explore your favorite anime with high quality streaming.
            </p>
          </div>

          {/* A-Z Section */}
          <div className="space-y-3 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center lg:justify-start">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                A–Z LIST
              </h3>
              <span className="text-xs text-white/50">
                Browse alphabetically
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start max-w-xl">
              {[
                "All",
                "#",
                "0-9",
                ...Array.from({ length: 26 }, (_, i) =>
                  String.fromCharCode(65 + i)
                ),
              ].map((item, index) => (
                <Link
                  to={`az-list/${item === "All" ? "" : item}`}
                  key={index}
                  className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/15 text-white/60 hover:text-white rounded-md transition-all duration-200"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mb-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Legal */}
          <div className="text-xs text-white/40 max-w-3xl leading-relaxed text-center md:text-left">
            <p>
              {website_name} does not host any files, it merely pulls streams from
              third-party services. Legal issues should be taken up with the file
              hosts and providers. {website_name} is not responsible for any media
              files shown by the video providers.
            </p>

            <p className="mt-2">
              © {new Date().getFullYear()} {website_name}. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-5 justify-center md:justify-end text-sm">
            <Link
              to="/terms-of-service"
              className="text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>

            <Link
              to="/dmca"
              className="text-white/60 hover:text-white transition-colors"
            >
              DMCA
            </Link>

            <Link
              to="/contact"
              className="text-white/60 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
