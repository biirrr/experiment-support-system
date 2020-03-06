export interface Config {
    api: ApiConfig;
    experiment: ExperimentConfig;
}

export interface ApiConfig {
    baseUrl: string;
    csrfToken: string;
}

export interface ExperimentConfig {
    id: string;
}

export interface State {
    config: Config;
    experiment: Experiment | null;
    pages: PageDict;
    transitions: TransitionDict;
    ui: UIState;
}

export interface UIState {
    busy: boolean;
}

export interface Experiment {
    type: 'experiments';
    id: string;
    attributes: ExperimentAttributes;
    relationships: ExperimentRelationships;
}

export interface ExperimentAttributes {
    title: string;
    description: string;
    status: string;
}

export interface ExperimentRelationships {
    pages: ExperimentPagesRelationship;
    'first-page'?: PageReference;
}

export interface ExperimentPagesRelationship {
    data: PageReference[];
}

export interface PageReference {
    type: 'pages';
    id: string;
}

export interface Page {
    type: 'pages',
    id: string;
    attributes: PageAttributes;
    relationships: PageRelationships;
}

export interface PageAttributes {
    name: string;
    title: string;
}

export interface PageRelationships {
    experiment: PageExperimentRelationship;
    next: PageTransitionRelationship;
    prev: PageTransitionRelationship;
}

export interface PageExperimentRelationship {
    data: ExperimentReference;
}

export interface PageTransitionRelationship {
    data: TransitionReference[];
}

export interface ExperimentReference {
    type: 'experiments';
    id: string;
}

export interface PageDict {
    [x: string]: Page;
}

export interface Transition {
    type: 'transitions';
    id: string;
    attributes: TransitionAttributes;
    relationships: TransitionRelationships;
}

export interface TransitionAttributes {

}

export interface TransitionReference {
    type: 'transitions';
    id: string;
}

export interface TransitionRelationships {
    source: TransitionPageRelationship;
    target: TransitionPageRelationship;
}

export interface TransitionPageRelationship {
    data: PageReference;
}

export interface TransitionDict {
    [x: string]: Transition;
}

export interface SetPageMutation {
    id: string;
    page: Page;
}

export interface SetTransitionMutation {
    id: string;
    transition: Transition;
}

export interface UpdateAttribute {
    attribute: string;
    value: string;
}

export interface CreatePage {
    mode: 'first' | 'after';
    name: string;
    title: string;
    parentPageId: number | null;
}
