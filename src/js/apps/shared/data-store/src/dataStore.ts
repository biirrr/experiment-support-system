//import Vue from 'vue';
import axios from 'axios';
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
}

export interface DataStoreConfig {
    apiBaseUrl: string;
    csrfToken: string;
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

export default {
    state: {
        data: {},
    } as DataStoreState,

    mutations: {
/*        setObject(state: DataStoreState, payload: JSONAPIObject) {
            if (!state.data[payload.type]) {
                Vue.set(state.data, payload.type, {[payload.id]: payload});
            } else {
                Vue.set(state.data[payload.type], payload.id, payload);
            }
        },*/
    },

    actions: {
        async fetchAll({ commit, rootState }: any, payload: string) {
            commit('setBusy', true);
            const response = await axios.get(rootState.config.dataStore.apiBaseUrl + '/' + payload);
            response.data.data.forEach((item: JSONAPIObject) => {
                commit('setObject', item);
            });
            commit('setBusy', false);
        },

        async fetchSingle({ commit, rootState }: any, payload: Reference) {
            commit('setBusy', true);
            const response = await axios.get(rootState.config.dataStore.apiBaseUrl + '/' + payload.type + '/' + payload.id);
            commit('setObject', response.data.data);
            commit('setBusy', false);
        },

        async saveSingle({ commit, rootState }: any, payload: JSONAPIObject) {
            commit('setBusy', true);
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
        },
    },
};
