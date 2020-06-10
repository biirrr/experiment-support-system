// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepcopy from 'deepcopy';
import Vue from 'vue'
import Vuex from 'vuex'
import axios, { AxiosResponse } from 'axios';

import { Config, State,
    PageResponses, Participant, NestedStorage} from '@/interfaces';
import { sessionStoreValue, sessionLoadValue, sessionDeleteValue, localLoadValue, localStoreValue, localDeleteValue } from '@/storage';
import { Experiment } from '../models/experiment';
import { Page } from '../models/page';
import { Reference, JSONAPIModel } from '../models/base';
import { Question } from '../models/question';
import { Transition } from '../models/transition';
import { QuestionType } from '../models/questionType';

Vue.use(Vuex)

const typeMappings = {
    experiments: Experiment,
    pages: Page,
    questions: Question,
    transitions: Transition,
    'question-types': QuestionType,
} as {[key: string]: typeof JSONAPIModel};

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
        data: {},
        network: {},
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

        setPageResponses(state, payload: PageResponses) {
            Vue.set(state.progress.responses, payload.page, payload.responses);
            if (state.config.experiment) {
                sessionStoreValue(state.config.experiment.id + '.responses.' + payload.page, payload.responses as NestedStorage);
            }
        },

        setResponses(state, payload: NestedStorage) {
            Vue.set(state.progress, 'responses', payload);
        },

        setParticipant(state, payload: Participant) {
            Vue.set(state, 'participant', payload);
            sessionStoreValue(payload.relationships.experiment.data.id + '.participant', payload.id);
        },

        setModelData(state, payload: JSONAPIModel) {
            if (!state.data[payload.type]) {
                Vue.set(state.data, payload.type, {});
            }
            Vue.set(state.data[payload.type], payload.id, payload);
        },

        setNetworkInFlight(state, payload: {reference: Reference, promise: Promise<AxiosResponse>}) {
            if (state.network[payload.reference.type]) {
                Vue.set(state.network[payload.reference.type], payload.reference.id, payload.promise);
            } else {
                Vue.set(state.network, payload.reference.type, {[payload.reference.id]: payload.promise});
            }
        },
    },
    actions: {
        async init({ commit, dispatch, state }, payload: Config) {
            commit('setConfig', payload);
            commit('setBusy', true);
            try {
                const experiment = await dispatch('fetchObject', {type: 'experiments', id: state.config.experiment.id});
                let promises = (state.data.experiments[state.config.experiment.id]._relationships.pages?.data as Reference[]).map((ref: Reference) => {
                    return new Promise<Page>((resolve) => {
                        dispatch('fetchObject', ref).then((page) => {
                            const promises = [] as any[];
                            (page._relationships.questions?.data as Reference[]).forEach((ref: Reference) => {
                                promises.push(dispatch('fetchObject', ref));
                            });
                            (page._relationships.next?.data as Reference[]).forEach((ref: Reference) => {
                                promises.push(dispatch('fetchObject', ref));
                            });
                            Promise.all(promises).then(() => {
                                resolve(page);
                            });
                        });
                    });
                });
                await Promise.all(promises);
                if (state.data.questions) {
                    promises = [];
                    (Object.values(state.data.questions) as Question[]).forEach((question: Question) => {
                        promises.push(dispatch('fetchObject', question._relationships.questionType?.data));
                    });
                    await Promise.all(promises);
                    let loadedCount = -1;
                    while (loadedCount !== Object.values(state.data['question-types']).length) {
                        promises = [];
                        (Object.values(state.data['question-types']) as QuestionType[]).forEach((questionType) => {
                            if (questionType._relationships.parent) {
                                if (!state.data['question-types'][(questionType._relationships.parent.data as Reference).id]) {
                                    promises.push(dispatch('fetchObject', questionType._relationships.parent.data));
                                }
                            }
                        });
                        await Promise.all(promises);
                        loadedCount = Object.values(state.data['question-types']).length;
                    }
                }
                commit('setLoaded', true);
                commit('setBusy', false);
                dispatch('resetExperiment');
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async fetchObject({ commit, dispatch, state }, payload: Reference) {
            if (typeMappings[payload.type]) {
                if (state.network[payload.type] && state.network[payload.type][payload.id]) {
                    const response = await state.network[payload.type][payload.id];
                    if (response) {
                        return new typeMappings[payload.type](payload.id, response.data.data.attributes, response.data.data.relationships, state.data, dispatch);
                    } else {
                        throw 'Null response';
                    }
                } else {
                    let url = state.config.api.baseUrl + '/experiments/' + state.config.experiment.id + '/' + payload.type + '/' + payload.id;
                    if (payload.type === 'experiments') {
                        url = state.config.api.baseUrl + '/experiments/' + payload.id;
                    } else if (payload.type === 'question-types') {
                        url = state.config.api.extraUrl + '/question_types/' + payload.id;
                    }
                    const promise = axios.get(url);
                    commit('setNetworkInFlight', {reference: payload, promise: promise});
                    commit('setBusy', true);
                    const response = await promise;
                    const obj = new typeMappings[payload.type](payload.id, response.data.data.attributes, response.data.data.relationships, state.data, dispatch);
                    commit('setModelData', obj);
                    commit('setNetworkInFlight', {reference: payload, promise: null});
                    commit('setBusy', false);
                    return obj;
                }
            } else {
                throw 'Unknown object class to fetch: ' + payload.type;
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
                const responses = deepcopy(state.progress.responses);
                responses[payload.page] = payload.responses;
                await axios({
                    method: 'POST',
                    url: state.config.api.validationUrl,
                    data: {page: payload.page,
                           responses: responses},
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

        resetExperiment({ commit, getters, state}) {
            const experiment = getters.experiment;
            if (experiment && state.data.pages) {
                const completed = localLoadValue(experiment.id + '.completed', false);
                if (completed) {
                    commit('setCompleted', true);
                } else {
                    if (experiment.firstPage) {
                        const currentPageId = sessionLoadValue(experiment.id + '.progress.currentPage', experiment.firstPage.id) as string;
                        if (state.data.pages[currentPageId]) {
                            commit('setCurrentPage', state.data.pages[currentPageId]);
                        } else {
                            commit('setCurrentPage', experiment.firstPage);
                        }
                        const responses = sessionLoadValue(experiment.id + '.responses', null);
                        if (responses) {
                            commit('setResponses', responses);
                        }
                    }
                }
            }
        },

        async developmentResetExperiment({ dispatch, commit, state}) {
            console.log('FIXTHIS');
            /*if (state.experiment && state.experiment.attributes.status === 'development') {
                sessionDeleteValue(state.experiment.id);
                localDeleteValue(state.experiment.id);
                commit('setCompleted', false);
                commit('setResponses', {});
                await dispatch('loadParticipant');
                dispatch('resetExperiment');
            }*/
        },
    },
    getters: {
        experiment(state): Experiment | null {
            if (state.data.experiments && state.data.experiments[state.config.experiment.id]) {
                return state.data.experiments[state.config.experiment.id] as Experiment;
            }
            return null;
        }
    },
    modules: {
    }
})
