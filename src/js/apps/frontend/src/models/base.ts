import { Dispatch } from 'vuex';
import { DataState } from '@/interfaces';

export interface Reference {
    type: string;
    id: string;
}

export interface Attributes {
    [key: string]: string | boolean | string[] | number | Attributes;
}

export interface Relationships {
    [key: string]: null | SingleRelationship | ManyRelationship;
}

export interface SingleRelationship {
    data: Reference;
}

export interface ManyRelationship {
    data: Reference[];
}

export class JSONAPIModel {
    public id = '';
    public _attributes = {} as Attributes;
    private _relationships = {} as Relationships;
    private dispatch: Dispatch;
    private state: DataState;

    public constructor(id: string, attributes: Attributes, relationships: Relationships, state: DataState, dispatch: Dispatch) {
        this.id = id;
        this._attributes = attributes;
        this._relationships = relationships;
        this.state = state;
        this.dispatch = dispatch;

        /*this.attributes().forEach((attrName) => {
            Object.defineProperty(this, attrName, {
                get: () => { return this._attributes[attrName]; },
                set: (newValue: string | boolean | string[] | number | Attributes) => { this._attributes[attrName] = newValue; }
            });
        });*/
    }

    public fetchSingle(ref: Reference): JSONAPIModel | null {
        if (this.state[ref.type] && this.state[ref.type][ref.id]) {
            return this.state[ref.type][ref.id];
        } else {
            this.dispatch('fetchObject', ref);
            return null;
        }
    }
}
