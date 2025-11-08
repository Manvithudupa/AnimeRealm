return (
  <div className="min-h-screen bg-[#050505] text-white relative">
    {/* 🎞️ Background Hero Banner */}
    <div className="absolute inset-0">
      <img
        src={poster}
        alt={`${title} Banner`}
        className="w-full h-full object-cover opacity-20 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
    </div>

    {/* 🌟 Main Content */}
    <div className="relative z-10 container mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
      {/* Mobile */}
      <div className="block md:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-row gap-4">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-[130px] xs:w-[150px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
              {animeInfo.adultContent && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600/90 rounded-md text-[10px] font-semibold tracking-wide">
                  18+
                </div>
              )}
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 space-y-2">
            <h1 className="text-lg xs:text-xl font-bold tracking-tight leading-snug">
              {language === "EN" ? title : japanese_title}
            </h1>
            {language === "EN" && japanese_title && (
              <p className="text-white/50 text-[11px] xs:text-xs truncate">JP: {japanese_title}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tags.map(({ condition, icon, text }, index) =>
                condition && <Tag key={index} icon={icon} text={text} />
              )}
            </div>
          </div>
        </div>

        {/* Overview */}
        {info?.Overview && (
          <div className="text-gray-300 text-xs leading-relaxed">
            {info.Overview.length > 150 ? (
              <>
                {isFull ? info.Overview : <div className="line-clamp-3">{info.Overview}</div>}
                <button
                  className="mt-1 text-white/70 hover:text-white text-[10px] font-medium"
                  onClick={() => setIsFull(!isFull)}
                >
                  {isFull ? "Show Less" : "Read More"}
                </button>
              </>
            ) : (
              info.Overview
            )}
          </div>
        )}

        {/* Watch Button */}
        <div>
          {animeInfo?.animeInfo?.Status?.toLowerCase() !== "not-yet-aired" ? (
            <Link
              to={`/watch/${animeInfo.id}`}
              className="flex justify-center items-center w-full px-4 py-3 bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] rounded-lg text-white font-medium text-sm transition-all duration-300 hover:opacity-90"
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2 text-xs" />
              Watch Now
            </Link>
          ) : (
            <div className="flex justify-center items-center w-full px-4 py-3 bg-gray-700/60 rounded-lg">
              <span className="font-medium text-sm">Not Released</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="py-3 px-3 bg-white/5 backdrop-blur-sm rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Japanese", value: info?.Japanese },
              { label: "Synonyms", value: info?.Synonyms },
              { label: "Aired", value: info?.Aired },
              { label: "Premiered", value: info?.Premiered },
              { label: "Duration", value: info?.Duration },
              { label: "Status", value: info?.Status },
              { label: "MAL Score", value: info?.["MAL Score"] },
            ].map((item, index) => (
              <InfoItem key={index} {...item} isProducer={false} />
            ))}
          </div>

          {info?.Genres && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-gray-400 text-xs mb-1.5">Genres</p>
              <div className="flex flex-wrap gap-1">
                {info.Genres.map((genre, index) => (
                  <Link
                    to={`/genre/${genre.split(" ").join("-")}`}
                    key={index}
                    className="px-2 py-0.5 text-[10px] bg-white/10 rounded-md hover:bg-white/20 transition"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-10">
        {/* Poster */}
        <div className="relative w-[240px] lg:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          <img src={poster} alt={title} className="w-full h-full object-cover" />
          {animeInfo.adultContent && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-red-600/90 rounded-md text-xs font-semibold">
              18+
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-5">
          <h1 className="text-4xl font-bold leading-tight">{language === "EN" ? title : japanese_title}</h1>
          {language === "EN" && japanese_title && (
            <p className="text-white/50 text-base">JP Title: {japanese_title}</p>
          )}

          <div className="flex flex-wrap gap-2">{tags.map(({ condition, icon, text }, i) => condition && <Tag key={i} icon={icon} text={text} />)}</div>

          {info?.Overview && (
            <p className="text-gray-300 max-w-3xl text-base leading-relaxed">
              {isFull ? info.Overview : `${info.Overview.slice(0, 270)}...`}
              <button
                className="ml-2 text-white/70 hover:text-white text-sm font-medium"
                onClick={() => setIsFull(!isFull)}
              >
                {isFull ? "Show Less" : "Read More"}
              </button>
            </p>
          )}

          {animeInfo?.animeInfo?.Status?.toLowerCase() !== "not-yet-aired" ? (
            <Link
              to={`/watch/${animeInfo.id}`}
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2 text-sm" />
              Watch Now
            </Link>
          ) : (
            <div className="inline-flex items-center px-6 py-2.5 bg-gray-700/60 rounded-xl font-semibold text-white">
              Not Released
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Japanese", value: info?.Japanese },
                { label: "Synonyms", value: info?.Synonyms },
                { label: "Aired", value: info?.Aired },
                { label: "Premiered", value: info?.Premiered },
                { label: "Duration", value: info?.Duration },
                { label: "Status", value: info?.Status },
                { label: "MAL Score", value: info?.["MAL Score"] },
              ].map((item, index) => (
                <InfoItem key={index} {...item} isProducer={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* More Seasons */}
    {seasons?.length > 0 && (
      <div className="container mx-auto px-3 sm:px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">More Seasons</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {seasons.map((season, index) => (
            <Link
              to={`/${season.id}`}
              key={index}
              className="group relative rounded-lg overflow-hidden aspect-[3/1] transition-transform duration-300 hover:scale-[1.03]"
            >
              <img
                src={season.season_poster}
                alt={season.season}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
                  {season.season}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* Voice Actors */}
    {animeInfo?.charactersVoiceActors.length > 0 && (
      <div className="container mx-auto px-3 sm:px-6 py-12">
        <Voiceactor animeInfo={animeInfo} />
      </div>
    )}

    {/* Recommendations */}
    {animeInfo.recommended_data.length > 0 && (
      <div className="container mx-auto px-3 sm:px-6 py-12">
        <CategoryCard
          label="Recommended for You"
          data={animeInfo.recommended_data}
          limit={animeInfo.recommended_data.length}
          showViewMore={false}
        />
      </div>
    )}
  </div>
);
