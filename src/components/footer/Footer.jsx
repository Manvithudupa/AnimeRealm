import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";

function Footer() {
  const letters = [
    "All",
    "#",
    "0-9",
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ];

  return (
    <footer className="w-full bg-[#070707] border-t border-white/5 mt-10">
      <div className="max-w-[1920px] mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Branding */}
        <div>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            {website_name}
          </h1>
        </div>

        {/* A-Z */}
        <div className="w-full flex flex-wrap justify-start gap-1">
          {letters.map((item, index) => (
            <Link
              key={index}
              to={`az-list/${item === "All" ? "" : item}`}
              className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/15 text-white/60 hover:text-white rounded transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Links */}
        <div className="flex justify-start gap-5 text-xs">
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

        {/* Legal */}
        <p className="text-left text-[11px] text-white/40 max-w-4xl leading-snug">
          {website_name} does not host any files, it merely pulls streams from third-party
          services. Legal issues should be taken up with the file hosts and providers.
          {website_name} is not responsible for any media files shown by the video providers.
        </p>

        <p className="text-left text-[11px] text-white/40">
          © {new Date().getFullYear()} {website_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
