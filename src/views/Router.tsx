import { lazy, Suspense, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import RouteLoader from "../components/RouteLoader/RouteLoader";
const Home = lazy(() => import("./Home"));

export default function Router() {
    const routes = useMemo(
        () => [
            {
                path: "/",
                element: <Home />,
            },
        ],
        []
    );

    return (
        <Suspense fallback={<RouteLoader />}>
            <Routes>
                {routes.map((route, index) => (
                    <Route
                        path={route.path}
                        element={route.element}
                        key={index}
                    />
                ))}
            </Routes>
        </Suspense>
    );
}