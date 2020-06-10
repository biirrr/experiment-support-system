import { JSONAPIModel, multiRelationship, attribute } from './base';
import { QuestionType } from './questionType';

export interface QuestionTypeGroupsDict {
    [x: string]: QuestionTypeGroup;
}

export interface QuestionTypeAttribute {
    label: string;
    source: 'user';
    type: 'singleValue' | 'multiLineTextValue' | 'booleanValue' | 'listOfValues' | 'essQuestionCondition';
    allowed?: string[];
}

export class QuestionTypeGroup extends JSONAPIModel {
    public type = 'question-type-groups';

    @attribute title!: string;
    @attribute enabled!: boolean;
    @attribute position!: number;

    @multiRelationship 'question-types'!: QuestionType[];
}
