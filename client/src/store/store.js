import { create } from 'zustand'
import { persist } from 'zustand/middleware';

export const _useStore = create(persist(
    (set, get) => ({
        // Articles
        _article: {},
        setArticle: (payload) => set(() => ({ _article: payload })),
        addArticle: (payload) => set((state) => ({ _articles: [...state._articles, payload] })),
        deleteArticle: (id) => {
            set((state) => ({
                _articles: state._articles.filter((_a) => _a._id !== id),
            }));
        },

        _articles: [],
        setArticles: (payload) => set(() => ({ _articles: payload })),
        updateArticles: (payload) => set((state) => ({
            _articles: state._articles.map((_a) => {
                if (_a._id === payload._article._id) {
                    return {
                        ...payload._article,
                    };
                }
                return _a;
            })
        })),

        _articleToEdit: {},
        setArticleToEdit: (payload) => set(() => ({ _articleToEdit: payload })),
        clearArticleToEdit: () => set(() => ({ _articleToEdit: {} })),

        // Projects
        _project: {},
        addProject: (payload) => set((state) => ({ _projects: [...state._projects, payload] })),
        deleteProject: (id) => {
            set((state) => ({
                _projects: state._projects.filter((_p) => _p._id !== id),
            }));
        },

        _projects: [],
        setProjects: (payload) => set(() => ({ _projects: payload })),
        updateProjects: (payload) => set((state) => ({
            _projects: state._projects.map((_p) => {
                if (_p._id === payload._project._id) {
                    return {
                        ...payload._project,
                    };
                }
                return _p;
            })
        })),

        _projectToEdit: {},
        setProjectToEdit: (payload) => set(() => ({ _projectToEdit: payload })),
        clearProjectToEdit: () => set(() => ({ _projectToEdit: {} })),

        //Testimonies
        _testimony: {},
        addTestimony: (payload) => set((state) => ({ _testimonies: [...state._testimonies, payload] })),
        deleteTestimony: (id) => {
            set((state) => ({
                _testimonies: state._testimonies.filter((_t) => _t._id !== id),
            }));
        },

        _testimonies: [],
        setTestimonies: (payload) => set(() => ({ _testimonies: payload })),
        updateTestimonies: (payload) => set((state) => ({
            _testimonies: state._testimonies.map((_t) => {
                if (_t._id === payload._testimony._id) {
                    return {
                        ...payload._testimony,
                    };
                }
                return _t;
            })
        })),

        _testimonyToEdit: {},
        setTestimonyToEdit: (payload) => set(() => ({ _testimonyToEdit: payload })),
        clearTestimonyToEdit: () => set(() => ({ _testimonyToEdit: {} })),
    }),
    {
        name: '_userStorage',
        getStorage: () => sessionStorage
    }
));