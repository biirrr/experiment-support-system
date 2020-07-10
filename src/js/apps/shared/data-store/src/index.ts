import dataStoreModule, {
    JSONAPIObject, JSONAPIAttributes, JSONAPIRelationships, JSONAPIError, JSONAPIErrorSource,
    Reference, DataStoreState, DataStoreConfig,
    getSingle, getAll, errorsToDict
} from './dataStore';

export {
    // Interfaces
    JSONAPIObject,
    JSONAPIAttributes,
    JSONAPIRelationships,
    JSONAPIError,
    JSONAPIErrorSource,
    Reference,
    DataStoreState,
    DataStoreConfig,
    // Functions
    getSingle,
    getAll,
    errorsToDict,
    // Modules
    dataStoreModule,
}
