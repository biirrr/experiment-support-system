import { fetch } from './connection';
import { oauth2Token } from './authentication';

oauth2Token.subscribe((oauth2Token) => {
    if (oauth2Token) {
        getUser();
    }
});

export async function getUser() {
    const response = await fetch('/users/current');
    console.log(response);
}
