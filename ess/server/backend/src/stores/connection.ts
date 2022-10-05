import { get } from 'svelte/store';

import { oauth2Token } from './authentication';

/**
 * Send a request, adding the authorisation token.
 *
 * @param url The URL to request
 * @param init Additional request settings
 * @returns The response
 */
export async function fetch(url: string, init: RequestInit = null) {
    const token = get(oauth2Token);
    if (token) {
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
    return await window.fetch('http://localhost:8000' + url, init);
}
