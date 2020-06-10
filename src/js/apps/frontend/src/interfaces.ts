import { AxiosResponse } from 'axios';
import { Page, VuexState } from 'ess-shared';

export interface StringKeyValueDict {
    [x: string]: string;
}

export interface Config {
    api: ApiConfig;
    experiment: ExperimentConfig;
}

export interface ApiConfig {
    baseUrl: string;
    extraUrl: string;
    csrfToken: string;
    validationUrl: string;
    submissionUrl: string;
}

export interface ExperimentConfig {
    id: string;
}

export interface State {
    config: Config;
    progress: ExperimentProgress;
    participant: Participant | null;
    ui: UIState;
    vuexAPI: VuexState;
}

export interface ExperimentProgress {
    current: Page | null;
    completed: boolean;
    responses: ExperimentResponsesDict;
}

export interface UIState {
    loaded: boolean;
    busy: boolean;
    busyCounter: number;
    busyMaxCounter: number;
}

export interface NetworkState {
    [x: string]: {[x: string]: Promise<AxiosResponse> | null};
}

















export interface Error {
    title: string;
    source: ErrorSource;
}

export interface ErrorSource {
    pointer: string;
}

export interface ExperimentResponsesDict {
    [x: string]: ResponsesDict;
}

export interface ResponsesDict {
    [x: string]: undefined | null | string | string[] | ResponsesDict;
}

export interface ErrorsDict {
    [x: string]: string | ErrorsDict;
}

export interface PageResponses {
    page: string;
    responses: ResponsesDict;
}

export interface NestedStorage {
    [x: string]: null | string | string[] | number | boolean | NestedStorage;
}

export interface Participant {
    type: 'participants';
    id: string;
    attributes: StringKeyValueDict;
    relationships: ParticipantRelationships;
}

export interface ParticipantRelationships {
    experiment: ParticipantExperimentRelationship;
}

export interface ParticipantExperimentRelationship {
    data: {type: 'experiments', id: string};
}
