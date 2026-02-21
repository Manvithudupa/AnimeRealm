import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { HomeInfoProvider } from "./context/HomeInfoContext";
import { useAuth } from "./hooks/useAuth";

import Home from "./pages/Home/Home";
import AnimeInfo from "./pages/animeInfo/AnimeInfo";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import Category from "./pages/category/Category";
import AtoZ from "./pages/a2z/AtoZ";
import Search from "./pages/search/Search";
import Filter from "./pages/filter/Filter";
import Watch from "./pages/watch/Watch";
import Producer from "./components/producer/Producer";
import SplashScreen from "./components/splashscreen/SplashScreen";
import Terms from "./pages/terms/Terms";
import DMCA from "./pages/dmca/DMCA";
import Contact from "./pages/contact/Contact";
import Auth from "./pages/Auth/Auth";
import Profile from "./pages/Profile/Profile";
import Watchlist from "./pages/watchlist/Watchlist";
import Notifications from "./pages/notifications/Notifications";

import { azRoute, categoryRoutes } from "./utils/category.utils";
import "./App.css";

/* ================= AUTH PROTECTED ROUTE ================= */
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a Loader component
  if (!user) return <Navigate to="/auth" replace />;

  return children;
};

function App() {
  const location = useLocation();

  /* Scroll to top on route change */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const isSplashScreen = location.pathname === "/";

  return (
    <HomeInfoProvider>
      <div className="app-container px-4 lg:px-10">
        <main className="content max-w-[2048px] mx-auto w-full">
          {!isSplashScreen && <Navbar />}

          <Routes>
            {/* Splash / Home */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />

            {/* Auth */}
            <Route path="/auth" element={<Auth />} />

            {/* Anime */}
            <Route path="/random" element={<AnimeInfo random />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/:id" element={<AnimeInfo />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <AuthRoute>
                  <Profile />
                </AuthRoute>
              }
            />

            <Route
              path="/watchlist"
              element={
                <AuthRoute>
                  <Watchlist />
                </AuthRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <AuthRoute>
                  <Notifications />
                </AuthRoute>
              }
            />

            {/* Category Routes */}
            {categoryRoutes.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <Category
                    path={path}
                    label={path.split("-").join(" ")}
                  />
                }
              />
            ))}

            {/* A–Z Routes */}
            {azRoute.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={<AtoZ path={path} />}
              />
            ))}

            {/* Misc */}
            <Route path="/producer/:id" element={<Producer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/filter" element={<Filter />} />
            <Route path="/terms-of-service" element={<Terms />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<Contact />} />

            {/* Errors */}
            <Route path="/404-not-found-page" element={<Error error="404" />} />
            <Route path="/error-page" element={<Error />} />
            <Route path="*" element={<Error error="404" />} />
          </Routes>

          {!isSplashScreen && <Footer />}
        </main>

        <Analytics />
        <SpeedInsights />
      </div>
    </HomeInfoProvider>
  );
}

export default App;
