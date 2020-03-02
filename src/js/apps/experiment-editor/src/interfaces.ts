export interface Config {
    api: ApiConfig;
    experiment: ExperimentConfig;
}

export interface ApiConfig {
    baseUrl: string;
}

export interface ExperimentConfig {
    id: string;
}

export interface State {
    config: Config;
    experiment: Experiment | null;
    ui: UIState;
}

export interface UIState {
    busy: boolean;
}

export interface Experiment {
    type: 'experiments';
    id: string;
    attributes: ExperimentAttributes;
}

export interface ExperimentAttributes {
    title: string;
    description: string;
    status: string;
}
