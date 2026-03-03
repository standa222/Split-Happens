export const ROUTES = {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register'
    },
    GROUPS: {
        LIST: '/groups',
        DETAIL: '/groups/:groupId'
    },
    USER: {
        PROFILE: '/profile'
    },
    HOME: '/'
} as const;