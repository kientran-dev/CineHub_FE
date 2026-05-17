import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import VideoPlayer from "./pages/VideoPlayer";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Payment from "./pages/Payment";
import Favorites from "./pages/Favorites";
import WatchHistory from "./pages/WatchHistory";
import MovieList from "./pages/MovieList";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "movies/:type", Component: MovieList },
      { path: "movies/:filterType/:filterValue", Component: MovieList },
      { path: "movie/:id", Component: MovieDetail },
      { path: "watch/:id", Component: VideoPlayer },
      { path: "auth", Component: Auth },
      { path: "profile", Component: Profile },
      { path: "subscription", Component: Subscription },
      { path: "payment", Component: Payment },
      { path: "favorites", Component: Favorites },
      { path: "history", Component: WatchHistory },
      { path: "*", Component: NotFound }
    ]
  }
]);