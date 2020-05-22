import { NestedStorage } from '@/interfaces';

function storeValue(storage: Storage, path: string, value: null | string | number | boolean | NestedStorage) {
    let obj = {} as NestedStorage;
    const data = storage.getItem('ess:storage');
    if (data) {
        obj = JSON.parse(data);
    }
    const pathElements = path.split('.');
    let current = obj;
    for (let idx = 0; idx < pathElements.length; idx++) {
        const element = pathElements[idx];
        if (idx === pathElements.length - 1) {
            current[element] = value;
        } else {
            if (!current[element]) {
                current[element] = {};
            }
            current = current[element] as NestedStorage;
        }
    }
    storage.setItem('ess:storage', JSON.stringify(obj));
}

function loadValue(storage: Storage, path: string, defaultValue: null | string | number | boolean) {
    const data = storage.getItem('ess:storage');
    if (data) {
        const obj = JSON.parse(data) as NestedStorage;
        const pathElements = path.split('.');
        let current = obj;
        for (let idx = 0; idx < pathElements.length; idx++) {
            const element = pathElements[idx];
            if (idx === pathElements.length - 1) {
                if (current[element] !== undefined) {
                    return current[element];
                } else {
                    return defaultValue;
                }
            } else {
                if (current[element]) {
                    current = current[element] as NestedStorage;
                } else {
                    return defaultValue;
                }
            }
        }
    } else {
        return defaultValue;
    }
}

function deleteValue(storage: Storage, path: string) {
    let obj = {} as NestedStorage;
    const data = storage.getItem('ess:storage');
    if (data) {
        obj = JSON.parse(data);
    }
    const pathElements = path.split('.');
    let current = obj;
    for (let idx = 0; idx < pathElements.length; idx++) {
        const element = pathElements[idx];
        if (idx === pathElements.length - 1) {
            delete current[element];
        } else {
            if (!current[element]) {
                break;
            }
            current = current[element] as NestedStorage;
        }
    }
    storage.setItem('ess:storage', JSON.stringify(obj));
}

export function sessionStoreValue(path: string, value: null | string | number | boolean | NestedStorage) {
    storeValue(sessionStorage, path, value);
}

export function sessionLoadValue(path: string, defaultValue: null | string | number | boolean) {
    return loadValue(sessionStorage, path, defaultValue);
}

export function sessionDeleteValue(path: string) {
    return deleteValue(sessionStorage, path);
}

export function localStoreValue(path: string, value: null | string | number | boolean | NestedStorage) {
    storeValue(localStorage, path, value);
}

export function localLoadValue(path: string, defaultValue: null | string | number | boolean) {
    return loadValue(localStorage, path, defaultValue);
}

export function localDeleteValue(path: string) {
    return deleteValue(localStorage, path);
}
