import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Trending from "@/src/components/trending/Trending.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import ContinueWatching from "@/src/components/continue/ContinueWatching";
import TabbedAnimeSection from "@/src/components/tabbed-anime/TabbedAnimeSection.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();

  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;

  return (
    <>

      {/* ================= SPOTLIGHT ================= */}
      <div className="w-full bg-black">
        <Spotlight spotlights={homeInfo.spotlights} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="w-full bg-black px-4 max-[1200px]:px-0 text-white">

        {/* Genres */}
        <div className="mt-4">
          <Genre data={homeInfo.genres} />
        </div>

        {/* Continue Watching */}
        <div className="mt-4">
          <ContinueWatching />
        </div>

        {/* Trending */}
        <div className="mt-4">
          <Trending trending={homeInfo.trending} />
        </div>

        {/* Main + Sidebar */}
        <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col max-[1200px]:px-4 mt-6">

          {/* Main */}
          <div>

            {/* Latest Episodes */}
            <CategoryCard
              label="Latest Episode"
              data={homeInfo.latest_episode}
              className="mt-6"
              path="recently-updated"
              limit={12}
            />

            {/* ✅ Tabbed Section (Replaces Top Upcoming) */}
            <TabbedAnimeSection
              topAiring={homeInfo.top_airing}
              mostFavorite={homeInfo.most_favorite}
              latestCompleted={homeInfo.latest_completed}
              topUpcoming={homeInfo.top_upcoming}
              className="mt-4"
            />

          </div>

          {/* Sidebar */}
          <div className="w-full mt-6 space-y-6">
            <Topten data={homeInfo.topten} className="mt-4" />
          </div>

        </div>
      </div>
    </>
  );
}

export default Home;
