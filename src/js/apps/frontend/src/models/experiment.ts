import { Dispatch } from 'vuex';

import { DataState } from '@/interfaces';
import { Page, PageReference } from './page';
import { JSONAPIModel, Reference, Attributes } from './base';

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

function attribute(target: JSONAPIModel, key: string): any {
    return {
        get: function() { return this._attributes[key]; },
        set: function(newValue: any) { this._attributes[key] = newValue },
        enumerable: true,
        configurable: true,
    };
}

export class Experiment extends JSONAPIModel {
    public static type = 'experiments';

    @attribute title!: string;

    /*public get firstPage(): Page | null {
        if (this._relationships.firstPage) {
            return this.fetchSingle(this._relationships.firstPage.data as Reference) as Page | null;
        } else {
            return null;
        }
    }*/
}
