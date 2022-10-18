import { itemStore, collectionStore } from './connection';

export const experiment = itemStore('experiments');
export const experiments = collectionStore('experiments');
