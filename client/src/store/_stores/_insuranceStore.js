import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';

const ACTION_TYPES = {
    ADD_STATE: 'ADD_STATE',
    DELETE_STATE: 'DELETE_STATE',
    UPDATE_STATE_ITEM: 'UPDATE_STATE_ITEM',
    SET_STATE: 'SET_STATE',
    CLEAR_STATE: 'CLEAR_STATE',
    RESET_ALL: 'RESET_ALL'
};

const generateStateActions = (key, actionTypes, set, initialState) => ({
    [`${key}_${actionTypes.ADD_STATE}`]: (payload) => set(
        produce((state) => {
            if (Array.isArray(state[key])) {
                state[key].push(payload);
            } else {
                state[key] = { ...state[key], ...payload };
            }
        })
    ),
    [`${key}_${actionTypes.DELETE_STATE}`]: (id) => set(
        produce((state) => {
            if (Array.isArray(state[key])) {
                state[key] = state[key].filter(item => item._id !== id);
            } else {
                state[key] = {};
            }
        })
    ),
    [`${key}_${actionTypes.UPDATE_STATE_ITEM}`]: (payload) => set(
        produce((state) => {
            const itemIndex = state[key].findIndex(item => item._id === payload._id);
            if (itemIndex !== -1) {
                state[key][itemIndex] = payload;
            }
        })
    ),
    [`${key}_${actionTypes.SET_STATE}`]: (payload) => set(
        produce((state) => {
            state[key] = payload;
        })
    ),
    [`${key}_${actionTypes.CLEAR_STATE}`]: () => set(
        produce((state) => {
            state[key] = Array.isArray(state[key]) ? [] : {};
        })
    ),
    [`${key}_${actionTypes.RESET_ALL}`]: () => set({ ...initialState }),
});

const initialState = {
    _insurances: [],
    _insurance: {},
    _insuranceToEdit: {}
}

export const useInsuranceStore = create(persist(
    (set, get) => ({
        ...initialState,
        ...generateStateActions('_insurances', ACTION_TYPES, set, initialState),
        ...generateStateActions('_insurance', ACTION_TYPES, set, initialState),
        ...generateStateActions('_insuranceToEdit', ACTION_TYPES, set, initialState),
    }),
    {
        name: '_insuranceStorage',
        storage: sessionStorage,
    }
));