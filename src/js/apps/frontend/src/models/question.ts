import { JSONAPIModel, attribute, singleRelationship } from './base';
import { QuestionType } from './questionType';

export class Question extends JSONAPIModel {
    public type = 'questions';

    @singleRelationship questionType!: QuestionType | null;
}
