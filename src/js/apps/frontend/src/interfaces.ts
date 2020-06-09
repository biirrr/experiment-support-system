import { PagesDict } from '@/models/page';
import { Experiment } from './models/experiment';
import { AxiosResponse } from 'axios';
import { JSONAPIModel } from './models/base';

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

export interface State { // Needs clean
    config: Config;
    experiment: Experiment | null;
    pages: PageDict;
    transitions: TransitionDict;
    questionTypeGroups: QuestionTypeGroup[];
    questionTypes: QuestionTypeDict;
    questions: QuestionsDict;
    progress: ExperimentProgress;
    participant: Participant | null;
    data: DataState;
    network: NetworkState;
    ui: UIState;
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

export interface DataState {
    [x: string]: {[x: string]: JSONAPIModel};
}

export interface NetworkState {
    [x: string]: Promise<AxiosResponse>;
}















export interface QuestionTypeDict {
    [x: string]: QuestionType;
}

export interface PageReference {
    type: 'pages';
    id: string;
}

export interface Page {
    type: 'pages',
    id: string;
    attributes: PageAttributes;
    relationships: PageRelationships;
}

export interface PageAttributes {
    name: string;
    title: string;
}

export interface PageRelationships {
    experiment: PageExperimentRelationship;
    next: PageTransitionRelationship;
    prev: PageTransitionRelationship;
    questions: PageQuestionRelationship;
}

export interface PageExperimentRelationship {
    data: ExperimentReference;
}

export interface PageTransitionRelationship {
    data: TransitionReference[];
}

export interface PageQuestionRelationship {
    data: QuestionReference[];
}

export interface ExperimentReference {
    type: 'experiments';
    id: string;
}

export interface PageDict {
    [x: string]: Page;
}

export interface Transition {
    type: 'transitions';
    id?: string;
    attributes: StringKeyValueDict;
    relationships: TransitionRelationships;
}

export interface TransitionReference {
    type: 'transitions';
    id: string;
}

export interface TransitionRelationships {
    source: TransitionPageRelationship;
    target: TransitionPageRelationship;
}

export interface TransitionPageRelationship {
    data: PageReference;
}

export interface TransitionDict {
    [x: string]: Transition;
}

export interface Error {
    title: string;
    source: ErrorSource;
}

export interface ErrorSource {
    pointer: string;
}

export interface QuestionTypeGroup {
    type: 'question_type_groups',
    id: string;
    attributes: QuestionTypeGroupAttributes;
    relationships: QuestionTypeGroupRelationships;
}

export interface QuestionTypeGroupAttributes {
    title: string;
    enabled: boolean;
    position: number;
}

export interface QuestionTypeGroupRelationships {
    'question-types': QuestionTypeGroupQuestionTypeRelationship;
}

export interface QuestionTypeGroupQuestionTypeRelationship {
    data: QuestionTypeReference[];
}

export interface Question {
    type: 'questions';
    id: string;
    attributes: StringKeyValueDict;
    relationships: QuestionRelationships;
}

export interface QuestionRelationships {
    page: QuestionPageRelationship;
}

export interface QuestionPageRelationship {
    data: PageReference;
}

export interface QuestionReference {
    type: 'questions';
    id: string;
}

export interface QuestionTypeReference {
    type: 'question_types';
    id: string;
}

export interface QuestionType {
    type: 'question_types';
    id: string;
    attributes: QuestionTypeAttributes;
    relationships: QuestionTypeRelationships;
}

export interface QuestionTypeAttributes {
    [x:string]: string | QuestionTypeAttribute;
}

export interface QuestionTypeAttribute {
    source: 'user';
    type: 'singleValue' | 'multiLineTextValue' | 'booleanValue' | 'listOfValues';
    allowed?: string[];
}

export interface QuestionTypeRelationships {
    'question-type-group': QuestionTypeQuestionTypeGroupRelationship;
    'parent': QuestionTypeQuestionTypeRelationship;
}

export interface QuestionTypeQuestionTypeGroupRelationship {
    'data': QuestionTypeGroupReference;
}

export interface QuestionTypeQuestionTypeRelationship {
    'data': QuestionTypeReference;
}

export interface QuestionTypeGroupReference {
    type: 'question_type_groups';
    id: string;
}

export interface QuestionsDict {
    [x: string]: Question;
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
    data: ExperimentReference;
}
