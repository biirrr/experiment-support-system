import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import { Config, State, Experiment } from '@/interfaces';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            api: {
                baseUrl: '',
            },
            experiment: {
                id: '',
            }
        },
        experiment: null,
        ui: {
            busy: true,
        }
    } as State,
    mutations: {
        init(state, payload: Config) {
            state.config = payload;
        },

        setBusy(state, payload: boolean) {
            state.ui.busy = payload;
        },

        setExperiment(state, payload: Experiment) {
            state.experiment = payload;
        },
    },
    actions: {
        async loadExperiment({ commit, state }) {
            commit('setBusy', true);
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id);
                commit('setExperiment', response.data.data as Experiment);
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        }
    },
    modules: {
    }
})
