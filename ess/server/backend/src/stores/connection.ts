import { writable, derived, get } from 'svelte/store';

import { oauth2Token, refreshToken } from './authentication';


export const busyCounter = writable(0);
export const isBusy = derived(busyCounter, (busyCounter) => {
    return busyCounter > 0;
});

/**
 * Send a request, adding the authorisation token.
 *
 * @param url The URL to request
 * @param init Additional request settings
 * @returns The response
 */
export async function fetch(url: string, init: RequestInit = null) {
    busyCounter.update((count) => { return count + 1; });
    try {
        let token = get(oauth2Token);
        if (token) {
            if (token.expiresAt <= (new Date()).getTime()) {
                await refreshToken();
                token = get(oauth2Token);
            }
            if (!init) {
                init = {};
            }
            if (init.headers) {
                init.headers['Authorization'] = 'Bearer ' + token.accessToken;
            } else {
                init.headers = {
                    'Authorization': 'Bearer ' + token.accessToken,
                };
            }
        }
        if (!init.headers) {
            init.headers = {'Content-Type': 'application/json'};
        } else if (!init.headers['Content-Type']) {
            init.headers['Content-Type'] = 'application/json';
        }
        return await window.fetch('http://localhost:8000' + url, init);
    } finally {
        busyCounter.update((count) => { return count - 1; });
    }
}

/**
 * Store to fetch a single object.
 *
 * @param type The model type to fetch
 * @returns A custom store
 */
 export function itemStore(type: string) {
    const store = writable(null as Experiment);

    async function fetchItem(id: number): Promise<void> {
        const oldObject = get(store);
        if (oldObject !== null && oldObject.id !== id) {
            store.set(null);
        }
        const response = await fetch('/' + type + '/' + id.toString());
        if (response.status === 200) {
            store.set(await response.json());
        }
    }

    return {
        subscribe: store.subscribe,
        fetch: fetchItem,
    }
}

/**
 * Store to fetch a collection of objects.
 *
 * @param type The model type to fetch
 * @returns  A custom store
 */
export function collectionStore(type: string) {
    const store = writable([] as Experiment[]);
    let pastQuery = null;

    async function fetchCollection(query: string | null): Promise<void> {
        let url = '/' + type;
        if (query !== null) {
            url = url + query;
        }
        if (pastQuery !== query) {
            store.set([]);
        }
        const response = await fetch(url);
        if (response.status === 200) {
            store.set(await response.json());
        }
    }

    return {
        subscribe: store.subscribe,
        fetch: fetchCollection,
    }
}
