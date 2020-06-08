import { Dispatch } from 'vuex';

import { DataState } from '@/interfaces';
import { Page, PageReference } from './page';

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

export class Experiment {
    private dispatch: Dispatch;
    private state: DataState;
    public attributes: ExperimentAttributes;
    public relationships: ExperimentRelationships;
    public id: string;

    public constructor(id: string, attributes: ExperimentAttributes, relationships: ExperimentRelationships, state: DataState, dispatch: Dispatch) {
        this.id = id;
        this.attributes = attributes;
        this.relationships = relationships;
        this.state = state;
        this.dispatch = dispatch;
    }

    public get title(): string {
        return this.attributes.title;
    }

    public set title(newTitle: string) {
        this.attributes.title = newTitle;
    }

    public get description(): string {
        return this.attributes.description;
    }

    public set description(newDescription: string) {
        this.attributes.description = newDescription;
    }

    public get status(): string {
        return this.attributes.status;
    }

    public set status(newStatus: string) {
        this.attributes.status = newStatus;
    }

    public get firstPage(): Page | null {
        if (this.relationships.firstPage && this.state.pages[this.relationships.firstPage?.data.id]) {
            return this.state.pages[this.relationships.firstPage.data.id];
        } else {
            if (this.relationships.firstPage && this.relationships.firstPage.data.loading !== true) {
                this.relationships.firstPage.data.loading = true;
                this.dispatch('loadPage', this.relationships.firstPage.data.id);
            }
            return null;
        }
    }
}
