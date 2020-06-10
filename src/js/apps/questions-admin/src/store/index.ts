import Vue from 'vue';
import Vuex from 'vuex';

import { vuexAPI } from 'ess-shared';
import { Config } from '@/interfaces';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            api: {
                baseUrl: '',
                csrfToken: '',
            },
        },
    },

    mutations: {
        setConfig(state, payload: Config) {
            state.config = payload;
        },

        setBusy(state, payload: boolean) {
            console.log(payload);
        },
    },

    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            await dispatch('fetchAll', 'question-type-groups');
        },
    },

    modules: {
        vuexAPI,
    }
})
