import { request as nodeRequest, IncomingMessage } from 'http';

export async function request(url: string): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
        const req = nodeRequest(url, (res) => {
            if (res.statusCode === 200) {
                resolve(res);
            } else {
                reject();
            }
        });
        req.end();
    });
}
