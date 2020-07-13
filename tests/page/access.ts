import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Page Access`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Access all pages in an experiment', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('Welcome')
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Informed Consent'))
        .expect(Selector('h2').withText('Informed Consent').innerText).eql('Informed Consent');
});
