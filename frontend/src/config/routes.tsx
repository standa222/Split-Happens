import {ROUTES} from "../enums/routes";
import {GroupsPage} from "../pages/GroupsPage/GroupsPage";
import {HomePage} from "../pages/HomePage/HomePage";
import {GroupDetailPage} from "../pages/GroupDetailPage/GroupDetailPage";
import { ProfilePage } from "../pages/ProfilePage/ProfilePage";
import {FriendsPage} from "../pages/FriendsPage/FriendsPage";
import { FriendDetailPage } from "../pages/FriendsPage/FriendDetailPage";

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
    },
    {
        title: 'Friends',
        path: ROUTES.FRIENDS.LIST,
        url: ROUTES.FRIENDS.LIST,
        element: <FriendsPage />,
    },
    {
        title: 'Friend detail',
        path: ROUTES.FRIENDS.DETAIL,
        url: ROUTES.FRIENDS.DETAIL,
        element: <FriendDetailPage />,
    }
]
