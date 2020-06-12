import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';
import { dataStoreModule, Reference, JSONAPIObject } from 'data-store';

import { Config, State, Experiment, Page, CreatePageAction, QuestionTypeGroup, QuestionType,
    AddQuestionAction, Question, LoadQuestionAction, Transition, Result } from '@/interfaces';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            dataStore: {
                apiBaseUrl: '',
                csrfToken: '',
            },
            experiment: {
                id: '',
                externalUrl: '',
                downloadResultsUrl: '',
            }
        },
        ui: {
            busy: false,
            busyCounter: 0,
            busyMaxCounter: 0,
        }
    } as State,

    mutations: {
        setConfig(state, payload: Config) {
            state.config = payload;
        },

        setBusy(state, payload: boolean) {
            if (payload) {
                state.ui.busyCounter = state.ui.busyCounter + 1;
                state.ui.busyMaxCounter = state.ui.busyMaxCounter + 1;
            } else {
                state.ui.busyCounter = state.ui.busyCounter - 1;
                if (state.ui.busyCounter === 0) {
                    setTimeout(() => {
                        state.ui.busyMaxCounter = 0;
                    }, 400);
                }
            }
            state.ui.busy = state.ui.busyCounter > 0;
        },
    },

    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            await Promise.all([dispatch('loadQuestionTypes'), dispatch('loadExperiment')]);
        },

        async loadQuestionTypes({ dispatch, commit, state }) {
            const questionTypeGroups = await dispatch('fetchAll', 'question-type-groups');
            const promises = [] as any[];
            questionTypeGroups.forEach((questionTypeGroup: JSONAPIObject) => {
                (questionTypeGroup.relationships['question-types'].data as Reference[]).forEach((ref: Reference) => {
                    promises.push(dispatch('fetchSingle', ref));
                });
            })
            await Promise.all(promises);
            return questionTypeGroups;
        },

        async loadExperiment({ dispatch, state }) {
            const experiment = await dispatch('fetchSingle', { type: 'experiments', id: state.config.experiment.id })
            return experiment;
        },

        async updateExperiment({ dispatch, state }, payload: JSONAPIObject) {
            const experiment = await dispatch('saveSingle', payload);
        },

/*
        async loadPage({ commit, dispatch, state }, payload: string) {
            commit('setBusy', true);
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload);
                let existingQuestions = null;
                if (state.pages[payload]) {
                    existingQuestions = state.pages[payload].relationships.questions.data.map((questionRef) => {
                        return questionRef.id
                    });
                }
                const page = response.data.data as Page;
                commit('setPage', page);
                const promises = [];
                for (let idx = 0; idx < page.relationships.next.data.length; idx++) {
                    promises.push(dispatch('loadTransition', page.relationships.next.data[idx].id));
                }
                const newQuestionIds = [] as string[];
                for (let idx = 0; idx < page.relationships.questions.data.length; idx++) {
                    newQuestionIds.push(page.relationships.questions.data[idx].id);
                    promises.push(dispatch('loadQuestion', {
                        pageId: payload,
                        questionId: page.relationships.questions.data[idx].id
                    }));
                }
                await Promise.all(promises);
                // Clear out any deleted questions from the state
                if (existingQuestions) {
                    existingQuestions.forEach((qid) => {
                        if (newQuestionIds.indexOf(qid) < 0) {
                            commit('deleteQuestion', state.questions[qid]);
                        }
                    });
                }
                dispatch('loadResult', page.id);
                commit('setBusy', false);
                return Promise.resolve(page);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async loadTransition({ commit, state}, payload: string) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions/' + payload);
                commit('setTransition', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },


        async loadQuestion({ commit, state }, payload: LoadQuestionAction) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.pageId + '/questions/' + payload.questionId);
                commit('setQuestion', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async loadResults({ commit, dispatch, state}) {
            try {
                commit('setBusy', true);
                const promises = [];
                const pages = Object.values(state.pages);
                for (let idx = 0; idx < pages.length; idx++) {
                    promises.push(dispatch('loadResult', pages[idx].id));
                }
                await Promise.all(promises);
                commit('setBusy', false);
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async loadResult({ commit, state }, payload: string) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/results/' + payload);
                commit('setResult', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async updateExperiment({ commit, state }, payload: Experiment) {
            try {
                commit('setBusy', true);
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
                commit('setExperiment', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
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
                const page = response.data.data
                commit('setPage', page);
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
                        id: page.id,
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
                                            id: page.id,
                                        },
                                    },
                                }
                            }
                        },
                        headers: {
                            'X-CSRF-TOKEN': state.config.api.csrfToken,
                        },
                    });
                    commit('setTransition', response.data.data);
                    dispatch('loadPage', payload.parentPageId);
                }
                commit('setBusy', false);
                return Promise.resolve(page);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async updatePage({ commit, state }, payload: Page) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
                commit('setPage', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async deletePage({ commit, dispatch, state}, payload: Page) {
            try {
                commit('setBusy', true);
                await axios({
                    method: 'delete',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.id,
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
                commit('deletePage', payload);
                dispatch('loadExperiment');
                commit('setBusy', false);
                return Promise.resolve();
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
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
                await dispatch('updatePage', page);
                commit('setBusy', false);
                return Promise.resolve(question);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async updateQuestion({ commit, state }, payload: Question) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.relationships.page.data.id + '/questions/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setQuestion', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async deleteQuestion({ commit, dispatch, state }, payload: Question) {
            try {
                commit('setBusy', true);
                await axios({
                    method: 'delete',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload.relationships.page.data.id + '/questions/' + payload.id,
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                dispatch('loadPage', payload.relationships.page.data.id);
                commit('setBusy', false);
                return Promise.resolve()
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async createTransition({ commit, state}, payload: Transition) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'post',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions',
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setTransition', response.data.data);
                this.dispatch('loadPage', response.data.data.relationships.source.data.id);
                this.dispatch('loadPage', response.data.data.relationships.target.data.id);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async updateTransition({ commit, state }, payload: Transition) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setTransition', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async deleteTransition({ commit, state }, payload: Transition) {
            try {
                commit('setBusy', true);
                await axios({
                    method: 'delete',
                    url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/transitions/' + payload.id,
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                this.dispatch('loadPage', payload.relationships.source.data.id);
                this.dispatch('loadPage', payload.relationships.target.data.id);
                commit('setBusy', false);
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        }*/
    },

    getters: {
        experiment(state) {
            if (state.dataStore.data.experiments && state.dataStore.data.experiments[state.config.experiment.id]) {
                return state.dataStore.data.experiments[state.config.experiment.id];
            } else {
                return null;
            }
        }
    },

    modules: {
        dataStore: dataStoreModule,
    }
})
