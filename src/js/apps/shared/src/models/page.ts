import { JSONAPIModel, attribute, multiRelationship } from './base';
import { ExperimentReference } from './experiment';
import { Question } from './question';
import { Transition } from './transition';

export interface PagesDict {
    [x: string]: Page;
}

export interface PageReference {
    type: 'pages';
    id: string;
}

export interface PageAttributes {
    name: string;
    title: string;
}

export interface PageRelationships {
    experiment: { data: ExperimentReference }
}

export class Page extends JSONAPIModel {
    public type = 'pages';

    @attribute name!: string;
    @attribute title!: string;

    @multiRelationship questions!: Question[];
    @multiRelationship next!: Transition[];
    @multiRelationship prev!: Transition[];
}
