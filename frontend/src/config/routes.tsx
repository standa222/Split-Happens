import {ROUTES} from "../enums/routes";
import {GroupsPage} from "../pages/GroupsPage/GroupsPage";
import {HomePage} from "../pages/HomePage/HomePage";
import {GroupDetailPage} from "../pages/GroupDetailPage/GroupDetailPage";
import { ProfilePage } from "../pages/ProfilePage/ProfilePage";

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
    },
    {
        title: 'Profile',
        path: ROUTES.USER.PROFILE,
        url: ROUTES.USER.PROFILE,
        element: <ProfilePage />,
    },
    {
        title: 'Group Detail',
        path: ROUTES.GROUPS.DETAIL,
        url: ROUTES.GROUPS.DETAIL,
        element: <GroupDetailPage />,
    }
]
