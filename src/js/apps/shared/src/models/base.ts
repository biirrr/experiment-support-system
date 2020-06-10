import { Dispatch } from 'vuex';

export interface DataState {
    [x: string]: {[x: string]: JSONAPIModel};
}

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

// @ts-ignore: TS6133
export function attribute(target: JSONAPIModel, key: string): any {
    return {
        get: function() {
            return this._attributes[key];
        },
        set: function(newValue: any) {
            this._attributes[key] = newValue;
        },
        enumerable: true,
        configurable: true,
    };
}

// @ts-ignore: TS6133
export function singleRelationship(target: JSONAPIModel, key: string): any {
    return {
        get: function() {
            if (this._relationships[key]) {
                const ref = this._relationships[key].data;
                if (this.state[ref.type] && this.state[ref.type][ref.id]) {
                    return this.state[ref.type][ref.id];
                } else {
                    this.dispatch('fetchObject', ref);
                }
            }
            return null;
        },
        set: function(newValue: any) {
            console.log(newValue);
        },
        enumerable: true,
        configurable: true,
    }
}

// @ts-ignore: TS6133
export function multiRelationship(target: JSONAPIModel, key: string): any {
    return {
        get: function() {
            if (this._relationships[key]) {
                return this._relationships[key].data.map((ref: Reference) => {
                    if (this.state[ref.type] && this.state[ref.type][ref.id]) {
                        return this.state[ref.type][ref.id];
                    } else {
                        this.dispatch('fetchObject', ref);
                        return null;
                    }
                }).filter((obj: JSONAPIModel | null) => {
                    return obj;
                });
            }
            return [];
        },
        set: function(newValue: any) {
            console.log(newValue);
        },
        enumerable: true,
        configurable: true,
    }
}

export class JSONAPIModel {
    public type = '';
    public id = '';
    public _attributes = {} as Attributes;
    public _relationships = {} as Relationships;
    private dispatch: Dispatch;
    private state: DataState;

    public constructor(id: string, attributes: Attributes, relationships: Relationships, state: DataState, dispatch: Dispatch) {
        this.id = id;
        this._attributes = attributes;
        this._relationships = relationships;
        this.state = state;
        this.dispatch = dispatch;
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
