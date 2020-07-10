import Vue from 'vue';
import Vuex from 'vuex';

import { Config, State } from '@/interfaces';
import { dataStoreModule, JSONAPIObject } from 'data-store';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            dataStore: {
                apiBaseUrl: '',
                csrfToken: '',
            },
        },
        ui: {
            busy: false,
            busyCounter: 0,
            busyMaxCounter: 0,
        },
    } as State,

    mutations: {
        setConfig(state, payload: Config) {
            state.config = payload;
        },

        setBusy(state, payload: boolean) {
            state.ui.busy = payload;
            if (payload) {
                state.ui.busyCounter = state.ui.busyCounter + 1;
                state.ui.busyMaxCounter = state.ui.busyMaxCounter + 1;
            } else {
                state.ui.busyCounter = state.ui.busyCounter - 1;
            }
            if (state.ui.busyCounter === 0) {
                state.ui.busyMaxCounter = 0;
            }
        },
    },

    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            await dispatch('fetchAll', 'question-type-groups');
        },
    },

    modules: {
        dataStore: dataStoreModule,
    }
})
