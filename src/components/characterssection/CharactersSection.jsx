import { useState, useMemo } from "react";

const FALLBACK_IMG = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg";

const ROLE_ORDER = { MAIN: 0, SUPPORTING: 1, BACKGROUND: 2 };

const ROLE_BADGE = {
  MAIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SUPPORTING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BACKGROUND: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function CharacterCard({ character, preferredLanguage }) {
  const [imgError, setImgError] = useState(false);
  const [vaImgError, setVaImgError] = useState(false);

  const voiceActor = useMemo(() => {
    if (!character.voiceActors?.length) return null;
    return (
      character.voiceActors.find((va) => va.language === preferredLanguage) ||
      character.voiceActors[0]
    );
  }, [character.voiceActors, preferredLanguage]);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] transition-all duration-200 group">
      {/* Character side */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <img
            src={imgError ? FALLBACK_IMG : character.image}
            alt={character.name}
            onError={() => setImgError(true)}
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
            <p className="text-[10px] text-white/35 mt-0.5">{voiceActor.language}</p>
          </div>
          <img
            src={vaImgError ? FALLBACK_IMG : voiceActor.image}
            alt={voiceActor.name}
            onError={() => setVaImgError(true)}
            className="w-11 h-11 rounded-full object-cover border-2 border-white/10 opacity-70 group-hover:opacity-100 transition-all duration-200"
            loading="lazy"
            title={voiceActor.name}
          />
        </div>
      )}
    </div>
  );
}

function CharactersSection({ characters }) {
  const [showAll, setShowAll] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("Japanese");

  const languages = useMemo(() => {
    const langSet = new Set();
    characters.forEach((c) =>
      c.voiceActors?.forEach((va) => langSet.add(va.language))
    );
    return Array.from(langSet).sort();
  }, [characters]);

  const sorted = useMemo(
    () =>
      [...characters].sort(
        (a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99)
      ),
    [characters]
  );

  const displayed = showAll ? sorted : sorted.slice(0, 12);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white/90">
          Characters &amp; Voice Actors
        </h2>

        {/* Language selector */}
        {languages.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {displayed.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            preferredLanguage={preferredLanguage}
          />
        ))}
      </div>

      {/* Show more / less */}
      {sorted.length > 12 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="self-start text-sm text-white/50 hover:text-white/80 transition-colors duration-200 flex items-center gap-1.5"
        >
          {showAll ? (
            <>Show less ↑</>
          ) : (
            <>Show all {sorted.length} characters ↓</>
          )}
        </button>
      )}
    </div>
  );
}

export default CharactersSection;
