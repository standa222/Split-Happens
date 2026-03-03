import {RouteType} from "../config/routes";
import { Route } from "react-router-dom";

export function generateRoutes(routes: RouteType[]) {
    return routes.map((route) => <Route key={route.path} path={route.path} element={route.element} />);
}