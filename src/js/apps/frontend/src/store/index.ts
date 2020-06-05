import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import { Config, State, Experiment, Page, QuestionTypeGroup, QuestionType, Question, Transition,
    PageResponses, Participant, NestedStorage} from '@/interfaces';
import { sessionStoreValue, sessionLoadValue, sessionDeleteValue, localLoadValue, localStoreValue, localDeleteValue } from '@/storage';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            api: {
                baseUrl: '',
                extraUrl: '',
                csrfToken: '',
                validationUrl: '',
                submissionUrl: '',
            },
            experiment: {
                id: '',
            },
        },
        experiment: null,
        pages: {},
        transitions: {},
        questionTypeGroups: [],
        questionTypes: {},
        questions: {},
        progress: {
            current: null,
            completed: true,
            responses: {},
        },
        participant: null,
        ui: {
            loaded: false,
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

        setLoaded(state, payload: boolean) {
            state.ui.loaded = payload;
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
        },

        setTransition(state, payload: Transition) {
            if (payload.id) {
                Vue.set(state.transitions, payload.id, payload);
            }
        },

        setQuestion(state, payload: Question) {
            Vue.set(state.questions, payload.id, payload);
        },

        setCurrentPage(state, payload: Page | null) {
            Vue.set(state.progress, 'current', payload);
            if (state.experiment) {
                if (payload) {
                    sessionStoreValue(state.experiment.id + '.progress.currentPage', payload.id)
                } else {
                    sessionStoreValue(state.experiment.id + '.progress.currentPage', null)
                }
            }
        },

        setCompleted(state, payload: boolean) {
            Vue.set(state.progress, 'completed', payload);
            if (state.experiment && payload) {
                sessionDeleteValue(state.experiment.id);
                localStoreValue(state.experiment.id + '.completed', true);
            }
        },

        setPageResponses(state, payload: PageResponses) {
            Vue.set(state.progress.responses, payload.page, payload.responses);
            if (state.experiment) {
                sessionStoreValue(state.experiment.id + '.responses.' + payload.page, payload.responses as NestedStorage);
            }
        },

        setResponses(state, payload: NestedStorage) {
            Vue.set(state.progress, 'responses', payload);
        },

        setParticipant(state, payload: Participant) {
            Vue.set(state, 'participant', payload);
            sessionStoreValue(payload.relationships.experiment.data.id + '.participant', payload.id);
        },
    },
    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            commit('setBusy', true);
            try {
                await Promise.all([
                    dispatch('loadQuestionTypes'),
                    dispatch('loadExperiment'),
                    dispatch('loadParticipant'),
                ]);
                dispatch('resetExperiment');
                commit('setLoaded', true);
                commit('setBusy', false);
            } catch(error) {
                commit('setBusy', false);
            }
        },

        async loadQuestionTypes({ commit, state }) {
            try {
                commit('setBusy', true);
                let response = await axios.get(state.config.api.extraUrl + '/question_type_groups');
                const questionTypeGroups = response.data.data;
                commit('setQuestionTypeGroups', questionTypeGroups);
                for (let idx = 0; idx < questionTypeGroups.length; idx++) {
                    const questionTypeGroup = questionTypeGroups[idx];
                    try {
                        commit('setBusy', true);
                        for (let idx2 = 0; idx2 < questionTypeGroup.relationships['question-types'].data.length; idx2++) {
                            const questionType = questionTypeGroup.relationships['question-types'].data[idx2];
                            response = await axios.get(state.config.api.extraUrl + '/question_types/' + questionType.id);
                            commit('setQuestionType', response.data.data);
                        }
                        commit('setBusy', false);
                    } catch(error) {
                        commit('setBusy', false);
                    }
                }
                commit('setBusy', false);
                return Promise.resolve()
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject()
            }
        },

        async loadExperiment({ commit, dispatch, state }) {
            commit('setBusy', true);
            try {
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id);
                const experiment = response.data.data as Experiment;
                const promises = [];
                commit('setExperiment', experiment);
                for (let idx = 0; idx < experiment.relationships.pages.data.length; idx++) {
                    promises.push(dispatch('loadPage', experiment.relationships.pages.data[idx].id));
                }
                commit('setBusy', false);
                return Promise.all(promises);
            } catch (error) {
                return Promise.reject(error);
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
                const promises = [];
                for (let idx = 0; idx < page.relationships.next.data.length; idx++) {
                    promises.push(dispatch('loadTransition', page.relationships.next.data[idx].id));
                }
                const newQuestionIds = [] as string[];
                for (let idx = 0; idx < page.relationships.questions.data.length; idx++) {
                    newQuestionIds.push(page.relationships.questions.data[idx].id);
                    promises.push(dispatch('loadQuestion', [payload, page.relationships.questions.data[idx].id]));
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
                await Promise.all(promises);
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


        async loadQuestion({ commit, state }, payload: string[]) {
            try {
                commit('setBusy', true);
                const response = await axios.get(state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/pages/' + payload[0] + '/questions/' + payload[1]);
                commit('setQuestion', response.data.data);
                commit('setBusy', false);
                return Promise.resolve(response.data.data);
            } catch (error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async loadParticipant({ commit, dispatch, state}) {
            commit('setBusy', true);
            const participantId = sessionLoadValue(state.config.experiment.id + '.participant', null);
            if (participantId === null) {
                try {
                    const response = await axios({
                        method: 'POST',
                        url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/participants',
                        headers: {
                            'X-CSRF-TOKEN': state.config.api.csrfToken,
                        },
                    });
                    commit('setParticipant', response.data.data);
                    commit('setBusy', false);
                    return Promise.resolve(response.data.data);
                } catch (error) {
                    commit('setBusy', false);
                    return Promise.reject(error);
                }
            } else {
                try {
                    const response = await axios({
                        method: 'GET',
                        url: state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/participants/' + participantId,
                        headers: {
                            'X-CSRF-TOKEN': state.config.api.csrfToken,
                        },
                    });
                    commit('setParticipant', response.data.data);
                    commit('setBusy', false);
                    return Promise.resolve(response.data.data);
                } catch (error) {
                    sessionDeleteValue(state.config.experiment.id);
                    commit('setBusy', false);
                    return dispatch('loadParticipant');
                }
            }
        },

        async validateSubmission({ commit, state }, payload: PageResponses) {
            try {
                commit('setBusy', true);
                await axios({
                    method: 'POST',
                    url: state.config.api.validationUrl,
                    data: payload,
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    },
                });
                commit('setPageResponses', payload);
                commit('setBusy', false);
                return Promise.resolve(true);
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error.response.data.errors);
            }
        },

        async submitResponses({ commit, state }) {
            if (state.participant) {
                try {
                    commit('setBusy', true);
                    await axios({
                        method: 'POST',
                        url: state.config.api.submissionUrl,
                        data: {
                            participant: state.participant.id,
                            responses: state.progress.responses,
                        },
                        headers: {
                            'X-CSRF-TOKEN': state.config.api.csrfToken,
                        },
                    });
                    commit('setCurrentPage', null);
                    commit('setCompleted', true);
                    commit('setBusy', false);
                } catch(error) {
                    commit('setBusy', false);
                    return Promise.reject(error.response.data.errors);
                }
            }
        },

        resetExperiment({ commit, state}) {
            if (state.experiment) {
                const completed = localLoadValue(state.experiment.id + '.completed', false);
                if (completed) {
                    commit('setCompleted', true);
                } else {
                    if (state.experiment.relationships['first-page'] && state.pages[state.experiment.relationships['first-page'].data.id]) {
                        const currentPageId = sessionLoadValue(state.experiment.id + '.progress.currentPage', state.experiment.relationships['first-page'].data.id) as string;
                        if (state.pages[currentPageId]) {
                            commit('setCurrentPage', state.pages[currentPageId]);
                        } else if (state.pages[state.experiment.relationships['first-page'].data.id]) {
                            commit('setCurrentPage', state.pages[state.experiment.relationships['first-page'].data.id]);
                        }
                        const responses = sessionLoadValue(state.experiment.id + '.responses', null);
                        if (responses) {
                            commit('setResponses', responses);
                        }
                    }
                }
            }
        },

        async developmentResetExperiment({ dispatch, commit, state}) {
            if (state.experiment && state.experiment.attributes.status === 'development') {
                sessionDeleteValue(state.experiment.id);
                localDeleteValue(state.experiment.id);
                commit('setCompleted', false);
                commit('setResponses', {});
                await dispatch('loadParticipant');
                dispatch('resetExperiment');
            }
        },
    },
    modules: {
    }
})
