import {ROUTES} from "../enums/routes";
import {GroupsPage} from "../pages/GroupsPage/GroupsPage";
import {HomePage} from "../pages/HomePage/HomePage";

export type RouteType = {
    title: string;
    path: string;
    url: string;
    element: React.ReactNode;
}

export const navigations: RouteType[] = [
    {
        title: 'Groups',
        path: ROUTES.GROUPS.LIST,
        url: ROUTES.GROUPS.LIST,
        element: <GroupsPage />,
    },
    {
        title: 'Home',
        path: ROUTES.HOME,
        url: ROUTES.HOME,
        element: <HomePage />,
    }
]
