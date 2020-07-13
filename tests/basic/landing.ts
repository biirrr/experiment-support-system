import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Landing Page`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1024, 768);
});

test('Has the app title', async (test) => {
    await test
        .expect(Selector('.top-bar-left .menu .menu-text').innerText).eql('Experiment Support System');
});

test('Check warning on small screens', async (test) => {
    await test
        .resizeWindow(800, 600)
        .expect(Selector('h1', { visibilityCheck: true }).innerText).eql('Display unsupported');
});
