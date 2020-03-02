import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import { Config, State, Experiment, Page } from '@/interfaces';

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
        pages: null,
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

        addPage(state, payload: Page) {
            let pages = state.pages;
            if (pages === null) {
                pages = [];
            } else {
                pages = pages.slice();
            }
            pages.push(payload);
            state.pages = pages;
        }
    },
    actions: {
        async loadExperiment({ commit, state }) {
            commit('setBusy', true);
            try {
                let response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id);
                const experiment = response.data.data as Experiment
                commit('setExperiment', experiment);
                for (let idx = 0; idx < experiment.relationships.pages.data.length; idx++) {
                    response = await axios.get(state.config.api.baseUrl + '/pages/' + experiment.relationships.pages.data[idx].id);
                    commit('addPage', response.data.data);
                }
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
