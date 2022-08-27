import create from 'zustand';
import { persist } from 'zustand/middleware';

export const _useStore = create(persist(
    (set, get) => ({
        _user: {},
        setUser: (payload) => set(() => ({ _user: payload })),
        _users: [],
        setUsers: (payload) => set(() => ({ _users: payload }))
    }),
    {
        name: '_userStorage',
        getStorage: () => sessionStorage
    }
));