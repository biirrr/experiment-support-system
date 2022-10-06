import { writable } from 'svelte/store';

import { fetch } from './connection';
import { oauth2Token } from './authentication';

oauth2Token.subscribe((oauth2Token) => {
    if (oauth2Token) {
        getCurrentUser();
    }
});

/**
 * The current user
 */
export const currentUser = writable(null as User);

/**
 * Fetch the current user.
 */
export async function getCurrentUser() {
    const response = await fetch('/users/current');
    currentUser.set(await response.json());
}
