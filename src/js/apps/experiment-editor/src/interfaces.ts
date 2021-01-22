import { DataStoreConfig, DataStoreState } from 'data-store';

export interface StringKeyValueDict {
    [x: string]: string;
}

export interface Config {
    dataStore: DataStoreConfig;
    experiment: ExperimentConfig;
}

export interface ApiConfig {
    baseUrl: string;
    csrfToken: string;
}

export interface ExperimentConfig {
    id: string;
    userId: string;
    externalUrl: string;
    deleteUrl: string;
    downloadResultsUrl: string;
}

export interface State {
    config: Config;
    ui: UIState;
    dataStore: DataStoreState;
}

export interface UIState {
    busy: boolean;
    busyCounter: number;
    busyMaxCounter: number;
}

export interface QuestionTypeDict {
    [x: string]: QuestionType;
}

export interface Experiment {
    type: 'experiments';
    id: string;
    attributes: ExperimentAttributes;
    relationships: ExperimentRelationships;
}

export interface ExperimentAttributes {
    title: string;
    description: string;
    status: string;
}

export interface ExperimentRelationships {
    pages: ExperimentPagesRelationship;
    'first-page'?: ExperimentFirstPageReference;
}

export interface ExperimentPagesRelationship {
    data: PageReference[];
}

export interface ExperimentFirstPageReference {
    data: PageReference;
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
    attributes: TransitionAttributes;
    relationships: TransitionRelationships;
}

export interface TransitionAttributes {
    condition: 'unconditional' | 'answer';
    page_id?: string;
    question_id?: string;
    operator?: string;
    value?: string;
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

export interface SetPageMutation {
    id: string;
    page: Page;
}

export interface SetTransitionMutation {
    id: string;
    transition: Transition;
}

export interface UpdateAttribute {
    attribute: string;
    value: string;
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
    attributes: QuestionAttributes;
    relationships: QuestionRelationships;
}

export interface QuestionAttributes {
    [x: string]: string | string[] | QuestionAttributes;
}

export interface QuestionRelationships {
    page: QuestionPageRelationship;
    'question-type': QuestionQuestionTypeRelationship;
}

export interface QuestionPageRelationship {
    data: PageReference;
}

export interface QuestionQuestionTypeRelationship {
    data: QuestionTypeReference;
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
    label: string;
    source: 'user';
    type: 'singleValue' | 'multiLineTextValue' | 'booleanValue' | 'listOfValues' | 'essQuestionCondition';
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

export interface ResultsDict {
    [x: string]: Result;
}

export interface Result {
    type: 'results';
    id: string;
}

export interface AddQuestionMenuStructure {
    id: string;
    title: string;
    questionTypes: QuestionType[];
}
