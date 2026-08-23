import { useState, useEffect, useMemo } from "react";
import {
  cleanupScrollbar,
  toggleScrollbar,
} from "@/src/helper/toggleScrollbar";
import PageSlider from "../pageslider/PageSlider";

const FALLBACK_IMG = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";

const ROLE_BADGE = {
  MAIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SUPPORTING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BACKGROUND: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const PAGE_SIZE = 20;

function VoiceactorList({ characters, isOpen, onClose }) {
  const [page, setPage] = useState(1);
  const [preferredLanguage, setPreferredLanguage] = useState("Japanese");

  useEffect(() => {
    toggleScrollbar(isOpen);
    return () => {
      cleanupScrollbar();
    };
  }, [isOpen]);

  // Reset to page 1 when language changes
  useEffect(() => {
    setPage(1);
  }, [preferredLanguage]);

  const languages = useMemo(() => {
    const langSet = new Set();
    characters.forEach((c) =>
      c.voiceActors?.forEach((va) => langSet.add(va.language))
    );
    return Array.from(langSet).sort();
  }, [characters]);

  const totalPages = Math.max(1, Math.ceil(characters.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const displayed = characters.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[1000000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-screen w-full py-4 sm:py-8 px-2 sm:px-4 flex items-center justify-center">
        <div           className="w-full max-w-[920px] bg-[#0a0a0a]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl max-h-[85vh] flex flex-col mx-auto max-sm:max-h-[80vh] max-sm:w-[92%] max-sm:my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex flex-wrap items-center gap-3 p-3 sm:p-6 border-b border-zinc-800/50 flex-shrink-0">
            <h2 className="text-base sm:text-xl font-bold text-zinc-100">
              Characters &amp; Voice Actors
            </h2>

            {/* Language selector */}
            {languages.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mr-8 sm:mr-10">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPreferredLanguage(lang)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all duration-150 ${
                      preferredLanguage === lang
                        ? "bg-white text-black border-white font-semibold"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onClose}               className="absolute right-2 sm:right-4 top-2 sm:top-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-300"
            >
              <span className="text-lg sm:text-xl leading-none mb-0.5">&times;</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {displayed.map((character) => {
                const voiceActor =
                  character.voiceActors?.find(
                    (va) => va.language === preferredLanguage
                  ) || character.voiceActors?.[0];

                return (
                  <div
                    key={character.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] transition-all duration-200 group"
                  >
                    {/* Character side */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={character.image || FALLBACK_IMG}
                          alt={character.name}
                          onError={(e) => {
                            e.target.src = FALLBACK_IMG;
                          }}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white/10 group-hover:border-white/25 transition-all duration-200"
                          loading="lazy"
                        />
                        {character.role === "MAIN" && (
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-black" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate leading-tight">
                          {character.name}
                        </p>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            ROLE_BADGE[character.role] || ROLE_BADGE.BACKGROUND
                          }`}
                        >
                          {character.role}
                        </span>
                      </div>
                    </div>

                    {/* Voice actor side */}
                    {voiceActor && (
                      <div className="flex items-center gap-3 min-w-0 shrink-0">
                        <div className="text-right min-w-0 hidden sm:block">
                          <p className="text-sm text-white/60 truncate max-w-[100px] leading-tight">
                            {voiceActor.name}
                          </p>
                          <p className="text-[10px] text-white/35 mt-0.5">
                            {voiceActor.language}
                          </p>
                        </div>
                        <img
                          src={voiceActor.image || FALLBACK_IMG}
                          alt={voiceActor.name}
                          onError={(e) => {
                            e.target.src = FALLBACK_IMG;
                          }}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white/10 opacity-70 group-hover:opacity-100 transition-all duration-200"
                          loading="lazy"
                          title={voiceActor.name}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-2 sm:p-6 sm:pt-2 border-t border-zinc-800/50 flex-shrink-0">
              <PageSlider
                page={safePage}
                totalPages={totalPages}
                handlePageChange={setPage}
                start={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceactorList;
