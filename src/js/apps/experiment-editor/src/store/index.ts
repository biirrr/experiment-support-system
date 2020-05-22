import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import deepcopy from 'deepcopy';

import { Config, State, Experiment, Page, CreatePageAction, QuestionTypeGroup, QuestionType,
    AddQuestionAction, Question, LoadQuestionAction, Transition } from '@/interfaces';

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
                externalUrl: '',
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

        setQuestionTypeGroups(state, payload: QuestionTypeGroup[]) {
            Vue.set(state, 'questionTypeGroups', payload);
        },

        setQuestionType(state, payload: QuestionType) {
            Vue.set(state.questionTypes, payload.id, payload);
        },

        setExperiment(state, payload: Experiment) {
            Vue.set(state, 'experiment', payload);
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

        deletePage(state, payload: Page) {
            Vue.delete(state.pages, payload.id);
        },

        setTransition(state, payload: Transition) {
            if (payload.id) {
                Vue.set(state.transitions, payload.id, payload);
            }
        },

        setQuestion(state, payload: Question) {
            Vue.set(state.questions, payload.id, payload);
        },

        deleteQuestion(state, payload: Question) {
            Vue.delete(state.questions, payload.id);
        },
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
                for (let idx = 0; idx < page.relationships.next.data.length; idx++) {
                    dispatch('loadTransition', page.relationships.next.data[idx].id);
                }
                const newQuestionIds = [] as string[];
                for (let idx = 0; idx < page.relationships.questions.data.length; idx++) {
                    newQuestionIds.push(page.relationships.questions.data[idx].id);
                    dispatch('loadQuestion', {
                        pageId: payload,
                        questionId: page.relationships.questions.data[idx].id
                    });
                }
                // Clear out any deleted questions from the state
                if (existingQuestions) {
                    existingQuestions.forEach((qid) => {
                        if (newQuestionIds.indexOf(qid) < 0) {
                            commit('deleteQuestion', state.questions[qid]);
                        }
                    });
                }
                commit('setBusy', false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                commit('setBusy', false);
            }
        },

        async loadTransition({ commit, state}, payload: string) {
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
        }
    },
    modules: {
    }
})
