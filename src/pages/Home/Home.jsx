import { useEffect } from "react";
import website_name from "@/src/config/website.js";
import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import Trending from "@/src/components/trending/Trending.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import Topten from "@/src/components/topten/Topten.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import Schedule from "@/src/components/schedule/Schedule";
import ContinueWatching from "@/src/components/continue/ContinueWatching";
import TabbedAnimeSection from "@/src/components/tabbed-anime/TabbedAnimeSection";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();

  // ✅ Load Ad Script when component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "//pl28127253.effectivegatecpm.com/effbe0e0de0a07083d9b1f14527c63ca/invoke.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;

  return (
    <>
      <div className="pt-16 w-full">
        <Spotlight spotlights={homeInfo.spotlights} />
        <div className="mt-6">
          <Genre data={homeInfo.genres} />
        </div>

        <ContinueWatching />

        <div className="w-full grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex flex-col">
          {/* LEFT SECTION */}
          <div>
            <CategoryCard
              label="Latest Episode"
              data={homeInfo.latest_episode}
              className="mt-[60px]"
              path="recently-updated"
              limit={12}
            />

            <Schedule className="mt-8" />

            <TabbedAnimeSection
              topAiring={homeInfo.top_airing}
              mostFavorite={homeInfo.most_favorite}
              latestCompleted={homeInfo.latest_completed}
              className="mt-8"
            />
          </div>

          {/* RIGHT SECTION */}
          <div className="w-full mt-[60px]">
            <Trending trending={homeInfo.trending} />
            <Topten data={homeInfo.topten} className="mt-12" />
          </div>
        </div>

        {/* ✅ FULL LENGTH AD BELOW TOP 10 */}
        <div className="w-full mt-12 flex justify-center">
          <div
            id="container-effbe0e0de0a07083d9b1f14527c63ca"
            className="w-full"
          ></div>
        </div>
        {/* ✅ END OF FULL LENGTH AD */}
      </div>
    </>
  );
}

export default Home;
