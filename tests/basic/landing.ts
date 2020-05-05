import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Landing Page`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create');
    req.end();
}).page('http://localhost:6543/');

test('Has the app title', async (test) => {
    await test.expect(Selector('.top-bar-left .menu .menu-text').innerText).eql('Experiment Support System');
});
