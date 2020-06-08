import { Dispatch } from 'vuex';

import { ExperimentReference } from '@/models/experiment';
import { DataState } from '@/interfaces';

export interface PagesDict {
    [x: string]: Page;
}

export interface PageReference {
    type: 'pages';
    id: string;
    loading?: boolean;
}

export interface PageAttributes {
    name: string;
    title: string;
}

export interface PageRelationships {
    experiment: { data: ExperimentReference }
}

export class Page {
    public id: string;
    private attributes: PageAttributes;
    private relationships: PageRelationships;
    private state: DataState;
    private dispatch: Dispatch;

    public constructor(id: string, attributes: PageAttributes, relationships: PageRelationships, state: DataState, dispatch: Dispatch) {
        this.id = id;
        this.attributes = attributes;
        this.relationships = relationships;
        this.state = state;
        this.dispatch = dispatch;
    }
}
