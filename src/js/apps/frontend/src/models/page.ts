import { Dispatch } from 'vuex';

import { ExperimentReference } from '@/models/experiment';
import { DataState } from '@/interfaces';
import { JSONAPIModel } from './base';

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
    public static type = 'pages';
}
