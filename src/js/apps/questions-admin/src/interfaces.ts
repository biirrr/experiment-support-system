export interface StringKeyValueDict {
    [x: string]: string;
}

export interface Config {
    api: ApiConfig;
}

export interface ApiConfig {
    baseUrl: string;
    csrfToken: string;
}

export interface State {
    config: Config;
    questionTypeGroups: QuestionTypeGroupDict;
    questionTypes: QuestionTypeDict;
    ui: UIState;
}

export interface UIState {
    busy: boolean;
    busyCounter: number;
    newQuestionId: string;
}

export interface QuestionTypeGroupDict {
    [x: string]: QuestionTypeGroup;
}

export interface QuestionTypeDict {
    [x: string]: QuestionType;
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
    _position: number;
    _enabled: boolean;
    [x:string]: string | number | boolean;
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
