import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import router from '@/router/index';
import { Config, State, Experiment, Page, UpdateAttribute, CreatePage, SetPageMutation, SetTransitionMutation } from '@/interfaces';

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
        pages: {},
        transitions: {},
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

        setPage(state, payload: SetPageMutation) {
            Vue.set(state.pages, payload.id, payload.page);
            if (state.experiment) {
                if (!state.experiment.relationships) {
                    state.experiment.relationships = {pages: {data: []}};
                }
                if (!state.experiment.relationships.pages) {
                    state.experiment.relationships.pages = {data: []};
                }
                let found = false;
                for (let idx = 0; idx < state.experiment.relationships.pages.data.length; idx++) {
                    const page = state.experiment.relationships.pages.data[idx];
                    if (page.id === payload.page.id) {
                        found = true;
                        state.experiment.relationships.pages.data[idx] = {
                            type: payload.page.type,
                            id: payload.page.id,
                        };
                        break;
                    }
                }
                if (!found) {
                    state.experiment.relationships.pages.data.push({
                        type: payload.page.type,
                        id: payload.page.id,
                    });
                }
            }
        },

        setTransition(state, payload: SetTransitionMutation) {
            Vue.set(state.transitions, payload.id, payload.transition);
        }
    },

    actions: {
        async loadExperiment({ commit, dispatch, state }) {
            commit('setBusy', true);
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id);
                const experiment = response.data.data as Experiment;
                commit('setExperiment', experiment);
                for (let idx = 0; idx < experiment.relationships.pages.data.length; idx++) {
                    dispatch('loadPage', experiment.relationships.pages.data[idx].id);
                }
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },

        async loadPage({ commit, dispatch, state }, payload: number) {
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload);
                const page = response.data.data as Page;
                commit('setPage', {
                    id: payload,
                    page: page,
                });
                for (let idx = 0; idx < page.relationships.next.data.length; idx++) {
                    dispatch('loadTransition', page.relationships.next.data[idx].id);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },

        async loadTransition({ commit, state}, payload: number) {
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions/' + payload);
                commit('setTransition', {
                    id: payload,
                    transition: response.data.data,
                });
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
        },

        async updateExperiment({ commit, state }, payload: Experiment) {
            try {
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setExperiment', response.data.data as Experiment);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },

        async createPage({ commit, dispatch, state}, payload: CreatePage) {
            try {
                let response = await axios({
                    method: 'post',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages',
                    data: {
                        data: {
                            type: 'pages',
                            attributes: {
                                name: payload.name,
                                title: payload.title,
                            }
                        }
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
                commit('setPage', {
                    id: response.data.data.id,
                    page: response.data.data,
                });
                if (payload.mode === 'first') {
                    const experiment = deepcopy(state.experiment);
                    if (!experiment.relationships) {
                        experiment.relationships = {};
                    }
                    if (!experiment.relationships['first-page']) {
                        experiment.relationships['first-page'] = {data: {}};
                    }
                    experiment.relationships['first-page'].data = {
                        type: 'pages',
                        id: response.data.data.id,
                    };
                    dispatch('updateExperiment', experiment);
                } else {
                    dispatch('updateExperiment', state.experiment);
                    response = await axios({
                        method: 'post',
                        url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions',
                        data: {
                            data: {
                                type: 'transitions',
                                attributes: {

                                },
                                relationships: {
                                    source: {
                                        data: {
                                            type: 'pages',
                                            id: payload.parentPageId,
                                        },
                                    },
                                    target: {
                                        data: {
                                            type: 'pages',
                                            id: response.data.data.id,
                                        },
                                    },
                                }
                            }
                        },
                        headers: {
                            'X-CSRF-TOKEN': state.config.api.csrfToken,
                        },
                    });
                    commit('setTransition', {
                        id: response.data.data.id,
                        transition: response.data.data,
                    });
                    dispatch('loadPage', payload.parentPageId);
                }
                router.push('/pages');
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },

        async updatePage({ commit, state }, payload: Page) {
            try {
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.id,
                    data: {
                        data: payload
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            }
        },
    },
    modules: {
    }
})
