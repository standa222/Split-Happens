export const ROUTES = {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register'
    },
    GROUPS: {
        LIST: '/groups',
        DETAIL: '/groups/:groupId',
        detail: (groupId: number) => `/groups/${groupId}`,
    },
    USER: {
        PROFILE: '/profile'
    },
    FRIENDS: {
        LIST: '/friends',
        DETAIL: '/friends/:friendId',
        detail: (friendId: number) => `/friends/${friendId}`,
    },
    HOME: '/'
} as const;