import { get } from 'svelte/store';

import { oauth2Token, refreshToken } from './authentication';

/**
 * Send a request, adding the authorisation token.
 *
 * @param url The URL to request
 * @param init Additional request settings
 * @returns The response
 */
export async function fetch(url: string, init: RequestInit = null) {
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
    return await window.fetch('http://localhost:8000' + url, init);
}
