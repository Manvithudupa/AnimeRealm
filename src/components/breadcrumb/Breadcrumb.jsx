import { Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { MdChevronRight } from "react-icons/md";

/**
 * Breadcrumb navigation bar.
 *
 * Props:
 *  - items: Array of { label: string, href?: string }
 *           The last item is rendered as plain text (current page).
 *           All preceding items are rendered as links if `href` is supplied.
 */
function Breadcrumb({ items = [] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="w-full bg-[#111111] border-b border-white/5 px-4 py-2.5"
    >
      <ol className="mx-auto max-w-[1920px] flex items-center gap-1 text-sm flex-wrap">
        {/* Home icon link */}
        <li>
          <Link
            to="/home"
            className="text-white/60 hover:text-white transition-colors flex items-center"
            aria-label="Home"
          >
            <IoHomeOutline className="text-base" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${item.href ?? ""}`;
          return (
            <li key={key} className="flex items-center gap-1 min-w-0">
              <MdChevronRight className="text-white/30 text-lg flex-shrink-0" />
              {isLast || !item.href ? (
                <span
                  className={`truncate max-w-[200px] sm:max-w-xs ${
                    isLast ? "text-white font-medium" : "text-white/60"
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-white/60 hover:text-white transition-colors truncate max-w-[200px] sm:max-w-xs"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
