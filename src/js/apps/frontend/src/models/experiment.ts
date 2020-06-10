import { Page, PageReference } from './page';
import { JSONAPIModel, attribute, singleRelationship, multiRelationship } from './base';

export interface ExperimentReference {
    type: 'experiments';
    id: string;
}

export interface ExperimentAttributes {
    title: string;
    description: string;
    status: string;
}

export interface ExperimentRelationships {
    firstPage?: { data: PageReference };
    pages: { data: PageReference[] };
}

export class Experiment extends JSONAPIModel {
    public type = 'experiments';

    @attribute title!: string;
    @attribute description!: string;
    @attribute status!: string;

    @singleRelationship firstPage!: Page | null;
    @multiRelationship pages!: Page[];
}
