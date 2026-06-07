import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFire,
  faCirclePlay,
  faCalendarDays,
  faStar,
  faCompass,
  faHeart
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const MENU_ITEMS = [
  { name: "Home", path: "/home", icon: faHome },
  { name: "Popular", path: "/most-popular", icon: faFire },
  { name: "Recently Added", path: "/recently-added", icon: faCirclePlay },
  { name: "Top Upcoming", path: "/top-upcoming", icon: faStar },
  { name: "Schedule", path: "/schedule", icon: faCalendarDays },
  { name: "Random", path: "/random", icon: faCompass },
];

const SECONDARY_ITEMS = [
  { name: "Watchlist", path: "/watchlist", icon: faHeart },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const scrollPosition = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen) {
        scrollPosition.current = window.scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollPosition.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="sidebar-container" aria-hidden={!isOpen}>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-main ${isOpen ? 'sidebar-open' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <span className="sidebar-logo">ANIMEREALM</span>
            <button
              onClick={onClose}
              className="close-button"
            >
              <X size={24} />
            </button>
          </div>

          <div className="menu-section">
            <p className="menu-label">Main Menu</p>
            <nav>
              {MENU_ITEMS.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="menu-section pt-0">
            <p className="menu-label">Library</p>
            <nav>
              {SECONDARY_ITEMS.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="menu-section pt-0">
            <p className="menu-label">Language</p>
            <div className="flex bg-white/5 p-1 rounded-full border border-white/5 mx-2">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`flex-1 py-1.5 rounded-full text-[11px] font-black transition-all ${
                    language === lang
                      ? "bg-[#eb3349] text-white"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <p className="text-[10px] text-white/30 leading-relaxed">
              © {new Date().getFullYear()} ANIMEREALM. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
