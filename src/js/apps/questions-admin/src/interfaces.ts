import { DataStoreState, DataStoreConfig } from 'data-store';

export interface State {
    config: Config;
    dataStore: DataStoreState;
    ui: UIState;
}

export interface Config {
    dataStore: DataStoreConfig;
}

export interface UIState {
    busy: boolean;
    busyCounter: number;
    busyMaxCounter: number;
}
