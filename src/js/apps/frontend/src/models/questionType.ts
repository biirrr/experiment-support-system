import { JSONAPIModel, attribute, singleRelationship } from './base';

export interface QuestionTypeAttribute {
    label: string;
    source: 'user';
    type: 'singleValue' | 'multiLineTextValue' | 'booleanValue' | 'listOfValues' | 'essQuestionCondition';
    allowed?: string[];
}

export class QuestionType extends JSONAPIModel {
    public type = 'question-types';

    @singleRelationship parent!: QuestionType | null;
}
