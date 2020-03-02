import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import { Config, State, Experiment, Page, UpdateAttribute } from '@/interfaces';

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

        setPages(state, payload: Page[]) {
            state.pages = payload;
        }
    },
    actions: {
        async loadExperiment({ commit, state }) {
            commit('setBusy', true);
            try {
                let response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id);
                const experiment = response.data.data as Experiment;
                commit('setExperiment', experiment);
                const pages = [] as Page[];
                for (let idx = 0; idx < experiment.relationships.pages.data.length; idx++) {
                    response = await axios.get(state.config.api.baseUrl + '/pages/' + experiment.relationships.pages.data[idx].id);
                    pages.push(response.data.data);
                }
                commit('setPages', pages);
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },

        async updateExperimentAttribute({ commit, state }, payload: UpdateAttribute) {
            const experiment = deepcopy(state.experiment);
            experiment.attributes[payload.attribute] = payload.value;
            try {
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + experiment.id,
                    data: {
                        data: experiment,
                    },
                });
                commit('setExperiment', response.data.data as Experiment);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        }
    },
    modules: {
    }
})
