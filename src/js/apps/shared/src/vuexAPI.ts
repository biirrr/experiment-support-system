import axios from 'axios';
import { AxiosResponse } from 'axios';
import Vue from 'vue';

import { Experiment, ExperimentsDict } from "./models/experiment";
import { Page, PagesDict } from "./models/page";
import { Question } from "./models/question";
import { Transition } from "./models/transition";
import { QuestionType } from "./models/questionType";
import { JSONAPIModel, Reference, DataState } from "./models/base";
import { QuestionTypeGroup, QuestionTypeGroupsDict } from './models/questionTypeGroup';

const typeMappings = {
    experiments: Experiment,
    pages: Page,
    questions: Question,
    transitions: Transition,
    'question-types': QuestionType,
    'question-type-groups': QuestionTypeGroup,
} as {[key: string]: typeof JSONAPIModel};

export interface VuexState {
    data: DataState,
    network: {[x: string]: {[x: string]: Promise<AxiosResponse> | null}};
}

export default {
    state: {
        data: {},
        network: {},
    } as VuexState,

    mutations: {
        setModelData(state: any, payload: JSONAPIModel) {
            if (!state.data[payload.type]) {
                Vue.set(state.data, payload.type, {});
            }
            Vue.set(state.data[payload.type], payload.id, payload);
        },

        setNetworkInFlight(state: any, payload: {reference: Reference, promise: Promise<AxiosResponse>}) {
            if (state.network[payload.reference.type]) {
                Vue.set(state.network[payload.reference.type], payload.reference.id, payload.promise);
            } else {
                Vue.set(state.network, payload.reference.type, {[payload.reference.id]: payload.promise});
            }
        },
    },

    actions: {
        async fetchAll({ state, dispatch, commit, rootState }: any, payload: string) {
            commit('setBusy', true);
            const response = await axios.get(rootState.config.api.baseUrl + '/' + payload);
            response.data.data.forEach((data: any) => {
                const obj = new typeMappings[data.type](data.id, data.attributes, data.relationships, state.data, dispatch);
                commit('setModelData', obj);
            });
            commit('setBusy', false);
        },

        async fetchObject({ commit, dispatch, state, rootState }: any, payload: Reference) {
            if (typeMappings[payload.type]) {
                if (state.network[payload.type] && state.network[payload.type][payload.id]) {
                    const response = await state.network[payload.type][payload.id];
                    if (response) {
                        return new typeMappings[payload.type](payload.id, response.data.data.attributes, response.data.data.relationships, state.data, dispatch);
                    } else {
                        throw 'Null response';
                    }
                } else {
                    let url = rootState.config.api.baseUrl + '/experiments/' + rootState.config.experiment.id + '/' + payload.type + '/' + payload.id;
                    if (payload.type === 'experiments') {
                        url = rootState.config.api.baseUrl + '/experiments/' + payload.id;
                    } else if (payload.type === 'question-types') {
                        url = rootState.config.api.extraUrl + '/question_types/' + payload.id;
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
    },
    getters: {
        // @ts-ignore
        experiment(state: VuexState, getters: any, rootState: any): Experiment | null {
            if (rootState.config && rootState.config.experiment && getters.experiments[rootState.config.experiment.id]) {
                return getters.experiments[rootState.config.experiment.id] as Experiment;
            }
            return null;
        },

        experiments(state: VuexState): ExperimentsDict {
            if (state.data.experiments) {
                return state.data.experiments as ExperimentsDict;
            } else {
                return {}
            }
        },

        pages(state: VuexState): PagesDict {
            if (state.data.pages) {
                return state.data.pages as PagesDict;
            } else {
                return {}
            }
        },

        questionTypeGroups(state: VuexState): QuestionTypeGroupsDict {
            if (state.data['question-type-groups']) {
                return state.data['question-type-groups'] as QuestionTypeGroupsDict;
            } else {
                return {}
            }
        }
    }
}
