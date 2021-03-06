import axios, { AxiosResponse, AxiosError } from 'axios';
import { Dispatch } from 'vuex';

export interface JSONAPIObject {
    type: string;
    id: string;
    attributes: JSONAPIAttributes;
    relationships: JSONAPIRelationships;
}

export interface JSONAPIAttributes {
    [x: string]: string | boolean | string[] | JSONAPIAttributes;
}

export interface JSONAPIRelationships {
    [x: string]: { data: Reference | Reference[] };
}

export interface Reference {
    type: string;
    id: string;
}

export interface DataStoreState {
    data: {[x: string]: {[x: string]: JSONAPIObject}};
    inFlight: {[x: string]: {[x: string]: Promise<AxiosResponse> | null}};
}

export interface DataStoreConfig {
    apiBaseUrl: string;
    csrfToken: string;
}

export interface ErrorDict {
    [x: string]: string;
}

export interface JSONAPIError {
    title: string;
    source: JSONAPIErrorSource;
}

export interface JSONAPIErrorSource {
    pointer: string;
}


export function getSingle(dispatch: Dispatch, state: DataStoreState, ref: Reference): JSONAPIObject | null {
    if (state.data[ref.type] && state.data[ref.type][ref.id]) {
        return state.data[ref.type][ref.id];
    } else {
        if (ref.id != '') {
            dispatch('fetchSingle', ref);
        }
        return null;
    }
}

export function getAll(dispatch: Dispatch, state: DataStoreState, refs: Reference[]): JSONAPIObject[]  {
    return refs.map((ref) => {
        return getSingle(dispatch, state, ref);
    }).filter((obj) => {
        return obj !== null;
    }) as JSONAPIObject[];
}

export function errorsToDict(errors: AxiosError): ErrorDict {
    if (errors.response) {
        return errors.response.data.errors.reduce((obj: ErrorDict, error: JSONAPIError) => {
            const pointer = error.source.pointer.split('/');
            obj[pointer[pointer.length - 1]] = error.title;
            return obj;
        }, {});
    } else {
        return {};
    }
}

export default {
    state: {
        data: {},
        inFlight: {},
    },

    mutations: {
        setObject(state: DataStoreState, payload: JSONAPIObject) {
            if (state.data[payload.type]) {
                state.data[payload.type] = { ...state.data[payload.type], [payload.id]: payload };
            } else {
                state.data = { ...state.data, [payload.type]: { [payload.id]: payload } };
            }
        },

        deleteObject(state: DataStoreState, payload: JSONAPIObject | Reference) {
            if (state.data[payload.type]) {
                state.data[payload.type] = Object.fromEntries(Object.entries(state.data[payload.type]).filter((entry) => {
                    return entry[1].id !== payload.id;
                }));
            }
        },

        toggleInFlight(state: DataStoreState, payload: {ref: Reference, promise: Promise<AxiosResponse> | null }) {
            if (state.inFlight[payload.ref.type]) {
                state.inFlight[payload.ref.type] = { ...state.inFlight[payload.ref.type], [payload.ref.id]: payload.promise };
            } else {
                state.inFlight = { ...state.inFlight, [payload.ref.type]: { [payload.ref.id]: payload.promise }};
            }
        },
    },

    actions: {
        async fetchAll({ commit, rootState }: any, payload: string) {
            commit('setBusy', true);
            try {
                const response = await axios.get(rootState.config.dataStore.apiBaseUrl + '/' + payload);
                response.data.data.forEach((item: JSONAPIObject) => {
                    commit('setObject', item);
                });
                commit('setBusy', false);
                return response.data.data;
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async fetchSingle({ state, commit, rootState }: any, payload: JSONAPIObject | Reference) {
            if (state.inFlight[payload.type] && state.inFlight[payload.type][payload.id]) {
                const response = await state.inFlight[payload.type][payload.id];
                return response.data.data;
            } else {
                try {
                    const request = axios.get(rootState.config.dataStore.apiBaseUrl + '/' + payload.type + '/' + payload.id);
                    commit('toggleInFlight', {ref: payload, promise: request});
                    commit('setBusy', true);
                    const response = await request;
                    commit('setObject', response.data.data);
                    commit('setBusy', false);
                    commit('toggleInFlight', {ref: payload, promise: null});
                    return response.data.data;
                } catch(error) {
                    commit('setBusy', false);
                    commit('toggleInFlight', {ref: payload, promise: null});
                    return Promise.reject(error);
                }
            }
        },

        async createSingle({ commit, rootState }: any, payload: JSONAPIObject) {
            commit('setBusy', true);
            try {
                const response = await axios({
                    method: 'post',
                    url: rootState.config.dataStore.apiBaseUrl + '/' + payload.type,
                    data: {
                        data: payload
                    },
                    headers: {
                        'X-CSRF-TOKEN': rootState.config.dataStore.csrfToken,
                    }
                });
                commit('setObject', response.data.data);
                commit('setBusy', false);
                return response.data.data;
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async saveSingle({ commit, rootState }: any, payload: JSONAPIObject) {
            commit('setBusy', true);
            try {
                const response = await axios({
                    method: 'patch',
                    url: rootState.config.dataStore.apiBaseUrl + '/' + payload.type + '/' + payload.id,
                    data: {
                        data: payload
                    },
                    headers: {
                        'X-CSRF-TOKEN': rootState.config.dataStore.csrfToken,
                    }
                });
                commit('setObject', response.data.data);
                commit('setBusy', false);
                return response.data.data;
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async deleteSingle({ commit, rootState}: any, payload: JSONAPIObject | Reference) {
            commit('setBusy', true);
            try {
                await axios({
                    method: 'delete',
                    url: rootState.config.dataStore.apiBaseUrl + '/' + payload.type + '/' + payload.id,
                    headers: {
                        'X-CSRF-TOKEN': rootState.config.dataStore.csrfToken,
                    }
                });
                commit('deleteObject', payload);
                commit('setBusy', false);
                return true;
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },
    },
};
