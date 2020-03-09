import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import router from '@/router/index';
import { Config, State, Experiment, Page, CreatePageAction, UpdatePageAction, UpdateExperimentAction, QuestionTypeGroup,
    QuestionType, AddQuestionAction, Question, LoadQuestionAction, Transition } from '@/interfaces';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            api: {
                baseUrl: '',
                csrfToken: '',
            },
            experiment: {
                id: '',
            }
        },
        experiment: null,
        pages: {},
        transitions: {},
        questionTypeGroups: [],
        questionTypes: {},
        questions: {},
        ui: {
            busy: false,
            busyCounter: 0,
        }
    } as State,

    mutations: {
        setConfig(state, payload: Config) {
            state.config = payload;
        },

        setBusy(state, payload: boolean) {
            if (payload) {
                state.ui.busyCounter = state.ui.busyCounter + 1;
            } else {
                state.ui.busyCounter = state.ui.busyCounter - 1;
            }
            state.ui.busy = state.ui.busyCounter > 0;
        },

        setQuestionTypeGroups(state, payload: QuestionTypeGroup[]) {
            state.questionTypeGroups = payload;
        },

        setQuestionType(state, payload: QuestionType) {
            state.questionTypes[payload.id] = payload;
        },

        setExperiment(state, payload: Experiment) {
            state.experiment = payload;
        },

        setPage(state, payload: Page) {
            Vue.set(state.pages, payload.id, payload);
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
                    if (page.id === payload.id) {
                        found = true;
                        state.experiment.relationships.pages.data[idx] = {
                            type: payload.type,
                            id: payload.id,
                        };
                        break;
                    }
                }
                if (!found) {
                    state.experiment.relationships.pages.data.push({
                        type: payload.type,
                        id: payload.id,
                    });
                }
            }
        },

        setTransition(state, payload: Transition) {
            Vue.set(state.transitions, payload.id, payload);
        },

        setQuestion(state, payload: Question) {
            Vue.set(state.questions, payload.id, payload);
        }
    },

    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            dispatch('loadQuestionTypes');
        },

        async loadQuestionTypes({ commit, state }) {
            try {
                commit('setBusy', true);
                let response = await axios.get(state.config.api.baseUrl + '/question_type_groups');
                const questionTypeGroups = response.data.data;
                commit('setQuestionTypeGroups', questionTypeGroups);
                for (let idx = 0; idx < questionTypeGroups.length; idx++) {
                    const questionTypeGroup = questionTypeGroups[idx];
                    try {
                        commit('setBusy', true);
                        for (let idx2 = 0; idx2 < questionTypeGroup.relationships['question-types'].data.length; idx2++) {
                            const questionType = questionTypeGroup.relationships['question-types'].data[idx2];
                            response = await axios.get(state.config.api.baseUrl + '/question_types/' + questionType.id);
                            commit('setQuestionType', response.data.data);
                        }
                        commit('setBusy', false);
                    } catch(error) {
                        commit('setBusy', false);
                    }
                }
                commit('setBusy', false);
            } catch(error) {
                commit('setBusy', false);
            }
        },

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
            commit('setBusy', true);
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload);
                const page = response.data.data as Page;
                commit('setPage', page);
                for (let idx = 0; idx < page.relationships.next.data.length; idx++) {
                    dispatch('loadTransition', page.relationships.next.data[idx].id);
                }
                for (let idx = 0; idx < page.relationships.questions.data.length; idx++) {
                    dispatch('loadQuestion', {
                        pageId: payload,
                        questionId: page.relationships.questions.data[idx].id
                    });
                }
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                commit('setBusy', false);
            }
        },

        async loadTransition({ commit, state}, payload: number) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions/' + payload);
                commit('setTransition', response.data.data);
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                commit('setBusy', false);
            }
        },


        async loadQuestion({ commit, state }, payload: LoadQuestionAction) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.pageId + '/questions/' + payload.questionId);
                commit('setQuestion', response.data.data);
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                commit('setBusy', false);
            }
        },

        async updateExperiment({ commit, state }, payload: UpdateExperimentAction) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + payload.experiment.id,
                    data: {
                        data: payload.experiment,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setExperiment', response.data.data as Experiment);
                commit('setBusy', false);
            } catch (error) {
                if (payload.errors) {
                    payload.errors(error.response.data.errors);
                }
                commit('setBusy', false);
            }
        },

        async createPage({ commit, dispatch, state}, payload: CreatePageAction) {
            try {
                commit('setBusy', true);
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
                    // For a new first page, set the appropriate attribute
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
                    // For a new page after an existing page, add a transition
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
                commit('setBusy', false);
            } catch (error) {
                payload.errors(error.response.data.errors);
                commit('setBusy', false);
            }
        },

        async updatePage({ commit, state }, payload: UpdatePageAction) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.page.id,
                    data: {
                        data: payload.page
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
                commit('setPage', response.data.data);
                commit('setBusy', false);
            } catch (error) {
                if (payload.errors) {
                    payload.errors(error.response.data.errors);
                }
                commit('setBusy', false);
            }
        },

        async addQuestion({ commit, dispatch, state }, payload: AddQuestionAction) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'post',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.page.id + '/questions',
                    data: {
                        data: {
                            type: 'questions',
                            attributes: {},
                            relationships: {
                                'question-type': {
                                    data: {
                                        type: 'question-types',
                                        id: payload.questionType.id,
                                    }
                                }
                            }
                        }
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                const question = response.data.data;
                const page = deepcopy(payload.page);
                commit('setQuestion', question);
                if (payload.idx === -1) {
                    page.relationships.questions.data.push({
                        type: 'questions',
                        id: question.id,
                    });
                } else {
                    page.relationships.questions.data.splice(payload.idx, 0, {
                        type: 'questions',
                        id: question.id,
                    });
                }
                dispatch('updatePage', {
                    page: page,
                });
                commit('setBusy', false);
            } catch (error) {
                if (payload.errors) {
                    payload.errors(error.response.data.errors);
                }
                commit('setBusy', false);
            }
        },
    },
    modules: {
    }
})
