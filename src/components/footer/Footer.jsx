import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#070707] border-t border-white/5 mt-16">
      <div className="max-w-[1920px] mx-auto px-4 py-12 flex flex-col items-center gap-8">

        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            {logoTitle || "An!meRealm"}
          </h1>
          <p className="text-sm text-white/50">
            Your ultimate hub for anime streaming and discovery
          </p>
        </div>

        {/* A-Z List */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl">
          {[
            "All",
            "#",
            "0-9",
            ...Array.from({ length: 26 }, (_, i) =>
              String.fromCharCode(65 + i)
            ),
          ].map((item, index) => (
            <Link
              key={index}
              to={`az-list/${item === "All" ? "" : item}`}
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/15 text-white/60 hover:text-white rounded-md transition-all duration-200"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
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

        {/* Legal Text */}
        <p className="text-center text-xs text-white/40 max-w-2xl leading-relaxed">
          {website_name} does not host any files, it merely pulls streams from third-party
          services. Legal issues should be taken up with the file hosts and providers.
          {website_name} is not responsible for any media files shown by the video providers.
        </p>

        <p className="text-center text-xs text-white/40 mt-2">
          © {new Date().getFullYear()} {website_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
