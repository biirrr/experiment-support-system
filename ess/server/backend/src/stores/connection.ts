import { sessionLoadValue } from '../local-persistence';

/**
 * Send a request, adding the authorisation token.
 *
 * @param url The URL to request
 * @param init Additional request settings
 * @returns The response
 */
export async function fetch(url: string, init: RequestInit = null) {
    const token = sessionLoadValue('oauth2.token.accessToken', null);
    if (token) {
        if (!init) {
            init = {};
        }
        if (init.headers) {
            init.headers['Authorization'] = 'Bearer ' + token;
        } else {
            init.headers = {
                'Authorization': 'Bearer ' + token,
            };
        }
    }
    return await window.fetch('http://localhost:8000' + url, init);
}
