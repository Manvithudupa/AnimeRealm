import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#070707] border-t border-white/5 mt-12">
      <div className="max-w-[1920px] mx-auto px-4 py-8 flex flex-col items-center gap-6">

        {/* Branding */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {logoTitle || "An!meRealm"}
          </h1>
        </div>

        {/* A-Z List */}
        <div className="w-full max-w-4xl flex flex-wrap justify-center gap-1">
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
              className="flex-1 min-w-[28px] text-center px-2 py-1 text-xs bg-white/5 hover:bg-white/15 text-white/60 hover:text-white rounded-md transition-colors"
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
        <p className="text-center text-xs text-white/40 max-w-3xl leading-relaxed">
          {website_name} does not host any files, it merely pulls streams from third-party
          services. Legal issues should be taken up with the file hosts and providers.
          {website_name} is not responsible for any media files shown by the video providers.
        </p>

        <p className="text-center text-xs text-white/40 mt-1">
          © {new Date().getFullYear()} {website_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
