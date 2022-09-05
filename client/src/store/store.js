import create from 'zustand';
import { persist } from 'zustand/middleware';

export const _useStore = create(persist(
    (set, get) => ({
        _user: {},
        setUser: (payload) => set(() => ({ _user: payload })),
        _users: [],
        setUsers: (payload) => set(() => ({ _users: payload })),
        _articles: [],
        setArticles: (payload) => set(() => ({ _articles: payload })),
        _projects: [],
        setProjects: (payload) => set(() => ({ _projects: payload })),
    }),
    {
        name: '_userStorage',
        getStorage: () => sessionStorage
    }
));