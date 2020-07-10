// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';
import axios from 'axios';
import Vue from 'vue'
import Vuex from 'vuex'
import { dataStoreModule, Reference } from 'data-store';

import { Config, State, Participant, Page, ResponsesDict, NestedStorage } from '@/interfaces';
import { sessionStoreValue, sessionLoadValue, sessionDeleteValue, localLoadValue, localStoreValue, localDeleteValue } from '@/storage';


Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            dataStore: {
                apiBaseUrl: '',
                csrfToken: '',
            },
            api: {
                validationUrl: '',
                submissionUrl: '',
            },
            experiment: {
                id: '',
            },
        },
        ui: {
            loaded: false,
            busy: false,
            busyCounter: 0,
            busyMaxCounter: 0,
        },
        progress: {
            participant: null,
            current: null,
            completed: false,
            responses: {},
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
                    }, 100);
                }
            }
            state.ui.busy = state.ui.busyCounter > 0;
        },

        setLoaded(state, payload: boolean) {
            setTimeout(() => {
                state.ui.loaded = payload;
            }, 100);
        },

        setCurrentPage(state, payload: Page | null) {
            Vue.set(state.progress, 'current', payload);
            if (payload) {
                sessionStoreValue(state.config.experiment.id + '.progress.currentPage', payload.id)
            } else {
                sessionStoreValue(state.config.experiment.id + '.progress.currentPage', null)
            }
        },

        setCompleted(state, payload: boolean) {
            Vue.set(state.progress, 'completed', payload);
            if (payload) {
                sessionDeleteValue(state.config.experiment.id);
                localStoreValue(state.config.experiment.id + '.completed', true);
            }
        },

        setPageResponses(state, payload: ResponsesDict) {
            Vue.set(state.progress.responses, payload.page as string, payload.responses as ResponsesDict);
            if (state.config.experiment) {
                sessionStoreValue(state.config.experiment.id + '.responses.' + payload.page, payload.responses as NestedStorage);
            }
        },

        setResponses(state, payload: ResponsesDict) {
            Vue.set(state.progress, 'responses', payload);
            if (state.config.experiment) {
                sessionStoreValue(state.config.experiment.id + '.responses', payload as NestedStorage);
            }
        },

        setParticipant(state, payload: Participant) {
            Vue.set(state.progress, 'participant', payload);
            sessionStoreValue(payload.relationships.experiment.data.id + '.participant', payload.id);
        },
    },
    actions: {
        async init({ commit, dispatch, state }, payload: Config) {
            commit('setConfig', payload);
            commit('setBusy', true);
            await Promise.all([
                dispatch('loadExperiment', {type: 'experiments', id: state.config.experiment.id}),
                dispatch('setupParticipant'),
            ]);
            await dispatch('setupExperiment');
            commit('setBusy', false);
            commit('setLoaded', true);
        },

        async loadExperiment({ dispatch }, experimentRef: Reference) {
            const experiment = await dispatch('fetchSingle', experimentRef);
            const promises = experiment.relationships.pages.data.map((pageRef: Reference) => {
                return dispatch('loadPage', pageRef);
            })
            await Promise.all(promises);
            return experiment;
        },

        async loadPage({ dispatch }, pageRef: Reference) {
            const page = await dispatch('fetchSingle', pageRef);
            let promises = page.relationships.next.data.map((transitionRef: Reference) => {
                return dispatch('loadTransition', transitionRef);
            });
            promises = promises.concat(page.relationships.questions.data.map((questionRef: Reference) => {
                return dispatch('loadQuestion', questionRef);
            }));
            await Promise.all(promises);
            return page;
        },

        async loadTransition({ dispatch }, transitionRef: Reference) {
            const transition = await dispatch('fetchSingle', transitionRef);
            return transition;
        },

        async loadQuestion({ dispatch }, questionRef: Reference) {
            const question = await dispatch('fetchSingle', questionRef);
            await dispatch('loadQuestionType', question.relationships['question-type'].data);
            return question;
        },

        async loadQuestionType({ dispatch }, questionTypeRef: Reference) {
            const questionType = await dispatch('fetchSingle', questionTypeRef);
            return questionType;
        },

        async setupParticipant({ dispatch, commit, state }) {
            const participantId = sessionLoadValue(state.config.experiment.id + '.participant', null);
            if (participantId === null) {
                const participant = await dispatch('createSingle', {
                    type: 'participants',
                    attributes: {},
                    relationships: {
                        experiment: {
                            data: {
                                type: 'experiments',
                                id: state.config.experiment.id,
                            },
                        },
                    },
                });
                commit('setParticipant', participant);
            } else {
                try {
                    const participant = await dispatch('fetchSingle', {type: 'participants', id: participantId});
                    commit('setParticipant', participant);
                } catch(errors) {
                    console.log(errors);
                    sessionDeleteValue(state.config.experiment.id);
                    dispatch('setupParticipant');
                }
            }
        },

        async setupExperiment({ commit, getters, state}) {
            const experiment = getters.experiment;
            const completed = localLoadValue(experiment.id + '.completed', false);
            if (completed) {
                commit('setCompleted', true);
            } else {
                if (experiment.relationships['first-page']) {
                    const currentPageId = sessionLoadValue(experiment.id + '.progress.currentPage', experiment.relationships['first-page'].data.id) as string;
                    if (state.dataStore.data.pages[currentPageId]) {
                        commit('setCurrentPage', state.dataStore.data.pages[currentPageId]);
                    } else {
                        commit('setCurrentPage', experiment.relationships['first-page'].data.id);
                    }
                    const responses = sessionLoadValue(experiment.id + '.responses', null);
                    if (responses) {
                        commit('setResponses', responses);
                    }
                } else {
                    commit('setCompleted', true);
                }
            }
        },

        async validateSubmission({ commit, state }, payload: ResponsesDict) {
            try {
                commit('setBusy', true);
                const responses = deepcopy(state.progress.responses);
                responses[payload.page] = payload.responses;
                await axios({
                    method: 'POST',
                    url: state.config.api.validationUrl,
                    data: {
                        page: payload.page,
                        responses: responses
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.dataStore.csrfToken,
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
            if (state.progress.participant) {
                try {
                    commit('setBusy', true);
                    await axios({
                        method: 'POST',
                        url: state.config.api.submissionUrl,
                        data: {
                            participant: state.progress.participant.id,
                            responses: state.progress.responses,
                        },
                        headers: {
                            'X-CSRF-TOKEN': state.config.dataStore.csrfToken,
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

        async developmentResetExperiment({ dispatch, commit, getters }) {
            if (getters.experiment && getters.experiment.attributes.status === 'development') {
                sessionDeleteValue(getters.experiment.id);
                localDeleteValue(getters.experiment.id);
                commit('setCompleted', false);
                commit('setResponses', {});
                await dispatch('setupParticipant');
                await dispatch('setupExperiment');
            }
        },
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
    },
})
