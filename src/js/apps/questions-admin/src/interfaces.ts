import { VuexState } from 'ess-shared';

export interface State {
    config: Config;
    vuexAPI: VuexState;
}

export interface Config {
    api: APIConfig;
}

export interface APIConfig {
    baseUrl: string;
    csrfToken: string;
}
