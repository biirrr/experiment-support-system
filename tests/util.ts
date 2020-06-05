import { request as nodeRequest } from 'http';

export async function request(url) {
    return new Promise((resolve, reject) => {
        const req = nodeRequest('http://localhost:6543/tests/create?obj=experiment3', (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject();
            }
        });
        req.end();
    });
}
