import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import { vuexAPI } from 'ess-shared';

import { Config, State, QuestionTypeGroup, QuestionType, QuestionTypeReference } from '@/interfaces';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        config: {
            api: {
                baseUrl: '',
                csrfToken: '',
            },
        },
        questionTypeGroups: {},
        questionTypes: {},
        ui: {
            busy: false,
            busyCounter: 0,
        },
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

        setQuestionTypeGroup(state, payload: QuestionTypeGroup) {
            Vue.set(state.questionTypeGroups, payload.id, payload);
        },

        setQuestionType(state, payload: QuestionType) {
            Vue.set(state.questionTypes, payload.id, payload);
        },

        removeQuestionType(state, payload: QuestionType) {
            Vue.delete(state.questionTypes, payload.id);
        },
    },
    actions: {
        async init({ commit, dispatch }, payload: Config) {
            commit('setConfig', payload);
            dispatch('loadQuestionTypes');
            dispatch('fetchAll', 'question-type-groups');
        },

        async loadQuestionTypes({ commit, state }) {
            try {
                commit('setBusy', true);
                let response = await axios.get(state.config.api.baseUrl + '/question_type_groups');
                const questionTypeGroups = response.data.data;
                for (let idx = 0; idx < questionTypeGroups.length; idx++) {
                    const questionTypeGroup = questionTypeGroups[idx];
                    commit('setQuestionTypeGroup', questionTypeGroup);
                    questionTypeGroup.relationships['question-types'].data.forEach(async (qtr: QuestionTypeReference) => {
                        try {
                            commit('setBusy', true);
                            response = await axios.get(state.config.api.baseUrl + '/question_types/' + qtr.id);
                            commit('setQuestionType', response.data.data);
                            commit('setBusy', false);
                        } catch(error) {
                            commit('setBusy', false);
                        }
                    });
                }
                commit('setBusy', false);
            } catch(error) {
                commit('setBusy', false);
            }
        },

        async updateQuestionTypeGroup({ commit, state }, payload: QuestionTypeGroup) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/question_type_groups/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setQuestionTypeGroup', response.data.data);
                commit('setBusy', false);
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async updateQuestionType({ commit, state }, payload: QuestionType) {
            try {
                commit('setBusy', true);
                const response = await axios({
                    method: 'patch',
                    url: state.config.api.baseUrl + '/question_types/' + payload.id,
                    data: {
                        data: payload,
                    },
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('setQuestionType', response.data.data);
                commit('setBusy', false);
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error);
            }
        },

        async deleteQuestionType({ commit, state , dispatch}, payload: QuestionType) {
            try {
                commit('setBusy', true);
                await axios({
                    method: 'delete',
                    url: state.config.api.baseUrl + '/question_types/' + payload.id,
                    headers: {
                        'X-CSRF-TOKEN': state.config.api.csrfToken,
                    }
                });
                commit('removeQuestionType', payload);
                dispatch('loadQuestionTypes');
                commit('setBusy', false);
                return Promise.resolve();
            } catch(error) {
                commit('setBusy', false);
                return Promise.reject(error)
            }
        },
    },
    modules: {
        vuexAPI,
    }
})
