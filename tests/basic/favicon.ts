import { request } from '../util';

fixture(`Favicon support`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create');
    await test
        .navigateTo('http://localhost:6543/');
});

test('Favicon is available as .ico', async (test) => {
    const response = await request('http://localhost:6543/favicon.ico');
    await test.expect(response.statusCode).eql(200);
    await test.expect(response.headers['content-type']).eql('image/x-icon');
    await test.expect(Number.parseInt(response.headers['content-length'])).eql(4286);
});

test('Favicon is available as .svg', async (test) => {
    const response = await request('http://localhost:6543/static/favicon.svg');
    await test.expect(response.statusCode).eql(200);
    await test.expect(response.headers['content-type']).eql('image/svg+xml; charset=UTF-8');
    await test.expect(Number.parseInt(response.headers['content-length'])).eql(440);
});
