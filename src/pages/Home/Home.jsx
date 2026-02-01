import website_name from "@/src/config/website.js";

import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Trending from "@/src/components/trending/Trending.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import Schedule from "@/src/components/schedule/Schedule";
import ContinueWatching from "@/src/components/continue/ContinueWatching";
import TabbedAnimeSection from "@/src/components/tabbed-anime/TabbedAnimeSection.jsx";
import SupportPopup from "@/src/components/SupportPopup/SupportPopup.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import MiniSupportCard from "@/src/components/minisupportcard/MiniSupportCard.jsx";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();

  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;

  return (
    <>
      {/* Support Popup */}
      <SupportPopup />

      {/* ================= SPOTLIGHT ================= */}
      <div className="w-full bg-black pt-16">
        <Spotlight spotlights={homeInfo.spotlights} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="w-full min-h-screen bg-black px-4 max-[1200px]:px-0 text-white">

        {/* Genres */}
        <div className="mt-6">
          <Genre data={homeInfo.genres} />
        </div>

        {/* Continue Watching */}
        <div className="mt-6">
          <ContinueWatching />
        </div>

        {/* Trending */}
        <div className="mt-6">
          <Trending trending={homeInfo.trending} />
        </div>

        {/* Main + Sidebar */}
        <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col max-[1200px]:px-4 mt-10">

          {/* Main */}
          <div>

            {/* Latest Episodes */}
            <CategoryCard
              label="Latest Episode"
              data={homeInfo.latest_episode}
              className="mt-[60px]"
              path="recently-updated"
              limit={12}
            />

            <Schedule />

            {/* ✅ Tabbed Section (Replaces Top Upcoming) */}
            <TabbedAnimeSection
              topAiring={homeInfo.top_airing}
              mostFavorite={homeInfo.most_favorite}
              latestCompleted={homeInfo.latest_completed}
              topUpcoming={homeInfo.top_upcoming}
              className="mt-[30px]"
            />

          </div>

          {/* Sidebar */}
          <div className="w-full mt-[60px] space-y-6">
            <Topten data={homeInfo.topten} className="mt-12" />
            <MiniSupportCard />
          </div>

        </div>
      </div>
    </>
  );
}

export default Home;
