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
