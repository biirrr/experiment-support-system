import { fetch } from './connection';

export async function getUser() {
    const response = await fetch('/users/current');
    console.log(response);
}
