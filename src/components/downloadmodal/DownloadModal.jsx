/* eslint-disable react/prop-types */
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faFile,
  faDownload,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import "./DownloadModal.css";

export default function DownloadModal({ open, onOpenChange, downloadOptions }) {
  const [expandedSections, setExpandedSections] = useState({
    sub: true,
    dub: true,
    raw: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDownload = (serverId, serverName) => {
    // Open the download link in a new tab
    if (serverId && serverId.startsWith("http")) {
      window.open(serverId, "_blank", "noopener,noreferrer");
    } else {
      console.warn("Invalid download link:", serverId);
    }
  };

  const renderDownloadSection = (title, items, type, icon) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedSections[type];

    return (
      <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(type)}
          className="w-full px-4 py-3 bg-[#1f1f1f] hover:bg-[#272727] flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={icon} className="text-gray-300 text-lg" />
            <span className="font-semibold text-white text-[15px]">
              {title}
            </span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {items.length}
            </span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-gray-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isExpanded && (
          <div className="bg-[#0a0a0a] px-4 py-3 space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222222] transition-colors group"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                    {item.serverName}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(item.serverId, item.serverName)}
                  className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-[12px]" />
                  <span className="max-[600px]:hidden">Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (
    !downloadOptions ||
    ((!downloadOptions.sub || downloadOptions.sub.length === 0) &&
      (!downloadOptions.dub || downloadOptions.dub.length === 0) &&
      (!downloadOptions.raw || downloadOptions.raw.length === 0))
  ) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border border-gray-700 rounded-lg max-w-2xl w-full max-[600px]:max-w-sm">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-white text-[22px] flex items-center gap-2">
            <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
            Download Options
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-2">
            Select a quality and format to download the episode
          </p>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {renderDownloadSection(
            "Subtitled",
            downloadOptions.sub,
            "sub",
            faClosedCaptioning
          )}
          {renderDownloadSection(
            "Dubbed",
            downloadOptions.dub,
            "dub",
            faMicrophone
          )}
          {renderDownloadSection(
            "Raw",
            downloadOptions.raw,
            "raw",
            faFile
          )}
        </div>

        <div className="border-t border-gray-700 pt-4 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
