import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import deepequal from 'deep-equal';
import { dataStoreModule, Reference, JSONAPIObject } from 'data-store';

import { Config, State, Experiment, Page, Question, Transition } from '@/interfaces';

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
                userId: '',
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

        async loadQuestionTypes({ dispatch }) {
            const questionTypeGroups = await dispatch('fetchAll', 'question-type-groups');
            const promises = [] as Promise<true>[];
            questionTypeGroups.forEach((questionTypeGroup: JSONAPIObject) => {
                (questionTypeGroup.relationships['question-types'].data as Reference[]).forEach((ref: Reference) => {
                    promises.push(dispatch('fetchSingle', ref));
                });
            })
            await Promise.all(promises);
            return questionTypeGroups;
        },

        async loadExperiment({ dispatch, state }) {
            const oldExperiment = state.dataStore.data.experiments ? state.dataStore.data.experiments[state.config.experiment.id] : null;
            const experiment = await dispatch('fetchSingle', { type: 'experiments', id: state.config.experiment.id });
            if (!deepequal(oldExperiment, experiment, {strict: true})) {
                let promises = experiment.relationships.pages.data.map((pageRef: Reference) => {
                    return dispatch('loadPage', pageRef);
                });
                promises = promises.concat(experiment.relationships.permissions.data.map((permissionRef: Reference) => {
                    return dispatch('loadPermission', permissionRef);
                }));
                await Promise.all(promises);
            }
            return experiment;
        },

        async saveExperiment({ dispatch, state }, experiment: Experiment) {
            const oldExperiment = state.dataStore.data.experiments ? state.dataStore.data.experiments[state.config.experiment.id] : null;
            experiment = await dispatch('saveSingle', experiment);
            if (!oldExperiment || !deepequal(oldExperiment.relationships, experiment.relationships, {strict: true})) {
                const promises = experiment.relationships.pages.data.map((pageRef: Reference) => {
                    return dispatch('loadPage', pageRef);
                });
                await Promise.all(promises);
            }
            return experiment;
        },

        async loadPermission({ dispatch, state }, permissionRef: Reference) {
            const oldPermission = state.dataStore.data['experiment-permissions'] ? state.dataStore.data['experiment-permissions'][permissionRef.id] : null;
            const permission = await dispatch('fetchSingle', permissionRef);
            if (!oldPermission || !deepequal(oldPermission.relationships, permission.relationships)) {
                await Promise.all([
                    dispatch('loadExperiment'),
                    dispatch('loadUser', permission.relationships.user.data),
                ]);
            }
            return permission;
        },

        async createPermission({ dispatch }, permission: JSONAPIObject) {
            permission = await dispatch('createSingle', permission);
            await Promise.all([
                dispatch('loadExperiment'),
                dispatch('loadUser', permission.relationships.user.data),
            ]);
        },

        async savePermission({ dispatch, state }, permission: JSONAPIObject) {
            const oldPermission = state.dataStore.data['experiment-permissions'] ? state.dataStore.data['experiment-permissions'][permission.id] : null;
            permission = await dispatch('saveSingle', permission);
            if (!oldPermission || !deepequal(oldPermission.relationships, permission.relationships)) {
                await Promise.all([
                    dispatch('loadExperiment'),
                    dispatch('loadUser', permission.relationships.user.data),
                ]);
            }
            return permission;
        },

        async loadUser({ dispatch }, userRef: Reference) {
            const user = await dispatch('fetchSingle', userRef);
            return user;
        },

        async loadPage({ dispatch, state }, pageRef: Reference) {
            const oldPage = state.dataStore.data.pages ? this.state.dataStore.data.pages[pageRef.id] : null;
            const page = await dispatch('fetchSingle', pageRef);
            if (!oldPage || !deepequal(oldPage.relationships, page.relationships, {strict: true})) {
                let promises = page.relationships.next.data.map((transitionRef: Reference) => {
                    return dispatch('loadTransition', transitionRef);
                });
                promises = promises.concat(page.relationships.questions.data.map((questionRef: Reference) => {
                    return dispatch('loadQuestion', questionRef);
                }));
                await Promise.all(promises);
            }
            return page;
        },

        async createPage({ dispatch }, page: Page) {
            page = await dispatch('createSingle', page);
            await dispatch('loadExperiment');
            return page;
        },

        async savePage({ dispatch, state }, page: Page) {
            const oldPage = state.dataStore.data.pages ? this.state.dataStore.data.pages[page.id] : null;
            page = await dispatch('saveSingle', page);
            if (!oldPage || !deepequal(oldPage.relationships, page.relationships, {strict: true})) {
                let promises = page.relationships.next.data.map((transitionRef: Reference) => {
                    return dispatch('loadTransition', transitionRef);
                });
                promises = promises.concat(page.relationships.questions.data.map((questionRef: Reference) => {
                    return dispatch('loadQuestion', questionRef);
                }));
                await Promise.all(promises);
            }
        },

        async deletePage({ dispatch }, page: Page) {
            let promises = [] as Promise<true>[];
            if (page.relationships.next) {
                promises = page.relationships.next.data.map((transitionRef: Reference) => {
                    return dispatch('deleteSingle', transitionRef);
                });
            }
            if (page.relationships.prev) {
                promises = promises.concat(page.relationships.prev.data.map((transitionRef: Reference) => {
                    return dispatch('deleteSingle', transitionRef);
                }));
            }
            await Promise.all(promises);
            await dispatch('deleteSingle', page);
            await dispatch('loadExperiment');
            return true;
        },

        async loadTransition({ dispatch, state }, transitionRef: Reference) {
            const oldTransition = state.dataStore.data.transitions ? this.state.dataStore.data.transitions[transitionRef.id] : null;
            const transition = await dispatch('fetchSingle', transitionRef);
            if (!oldTransition || !deepequal(oldTransition.relationships, transition.relationships, {strict: true})) {
                if (transition.relationships.source) {
                    await dispatch('loadPage', transition.relationships.source.data);
                }
                if (transition.relationships.target) {
                    await dispatch('loadPage', transition.relationships.target.data);
                }
            }
            return transition;
        },

        async createTransition({ dispatch }, transition: Transition) {
            transition = await dispatch('createSingle', transition);
            if (transition.relationships.source) {
                await dispatch('loadPage', transition.relationships.source.data);
            }
            if (transition.relationships.target) {
                await dispatch('loadPage', transition.relationships.target.data);
            }
            return transition;
        },

        async saveTransition({ dispatch, state }, transition: Transition) {
            const oldTransition = state.dataStore.data.transitions[transition.id as string];
            transition = await dispatch('saveSingle', transition);
            if (oldTransition.relationships.target) {
                await dispatch('loadPage', oldTransition.relationships.target.data);
            }
            if (transition.relationships.target) {
                await dispatch('loadPage', transition.relationships.target.data);
            }
            return transition;
        },

        async deleteTransition({ dispatch }, transition: Transition) {
            await dispatch('deleteSingle', transition);
            if (transition.relationships.source) {
                await dispatch('loadPage', transition.relationships.source.data);
            }
            if (transition.relationships.target) {
                await dispatch('loadPage', transition.relationships.target.data);
            }
        },

        async loadQuestion({ dispatch }, questionRef: Question | Reference) {
            const question = await dispatch('fetchSingle', questionRef);
            return question;
        },

        async createQuestion({ dispatch }, question: Question) {
            question = await dispatch('createSingle', question);
            return question;
        },

        async saveQuestion({ dispatch }, question: Question) {
            question = await dispatch('saveSingle', question);
            return question;
        },

        async deleteQuestion({ dispatch }, question: Question) {
            await dispatch('deleteSingle', question);
            await dispatch('loadPage', question.relationships.page.data);
            return true;
        },
    },

    getters: {
        experiment(state) {
            if (state.dataStore.data.experiments && state.dataStore.data.experiments[state.config.experiment.id]) {
                return state.dataStore.data.experiments[state.config.experiment.id];
            } else {
                return null;
            }
        },

        isOwner(state) {
            if (state.dataStore.data['experiment-permissions']) {
                return Object.values(state.dataStore.data['experiment-permissions']).filter((permission: JSONAPIObject) => {
                    return permission.attributes.role === 'owner' && permission.relationships.user.data.id === state.config.experiment.userId;
                });
            } else {
                return false;
            }
        }
    },

    modules: {
        dataStore: dataStoreModule,
    }
})
