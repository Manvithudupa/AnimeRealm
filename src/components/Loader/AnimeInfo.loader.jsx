import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import CategoryCardLoader from "./CategoryCard.loader";

const SkeletonItems = ({ count, className }) =>
  [...Array(count)].map((_, i) => (
    <Skeleton key={i} className={className} />
  ));

function AnimeInfoLoader() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= HERO ================= */}
      <section className="relative pt-14">
        {/* Background */}
        <div className="relative h-[50vh] overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent animeinfo-hero-overlay" />
        </div>

        {/* Info */}
        <div className="relative -mt-32 mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Poster */}
            <div className="w-40 md:w-52 aspect-[3/4] rounded-xl overflow-hidden shadow-xl shrink-0">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Details */}
            <div className="flex-1 pt-4 md:pt-20 space-y-4">

              {/* Meta */}
              <Skeleton className="h-3 w-[180px]" />

              {/* Title */}
              <Skeleton className="h-8 md:h-10 w-[80%]" />
              <Skeleton className="h-4 w-[50%]" />

              {/* Rating */}
              <Skeleton className="h-4 w-[90px]" />

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-10 w-[110px] rounded-lg" />
                <Skeleton className="h-10 w-[110px] rounded-lg" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <SkeletonItems
                  count={4}
                  className="h-6 w-[60px] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SYNOPSIS + INFO ================= */}
      <section className="py-10 px-5">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-3 gap-8">

          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-4 w-[120px]" />
            <SkeletonItems count={4} className="h-4 w-full max-w-3xl" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.05] rounded-xl p-5 border border-white/10 space-y-3">
              <Skeleton className="h-4 w-[110px]" />
              <SkeletonItems count={6} className="h-4 w-full" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= SEASONS ================= */}
      <section className="py-10 px-5 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-4 w-[120px] mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <SkeletonItems
              count={4}
              className="h-[90px] rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* ================= RECOMMENDATIONS ================= */}
      <div className="py-10">
        <CategoryCardLoader />
      </div>
    </div>
  );
}

export default AnimeInfoLoader;
