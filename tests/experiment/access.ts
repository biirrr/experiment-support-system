import { Selector } from 'testcafe';
import { request } from '../util';

fixture('Experiment Access').beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
});

test('Access experiment 1', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1');
});

test('Access experiment 2', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .expect(Selector('h1').withText('Experiment 2').innerText).eql('Experiment 2')
        .click(Selector('a').withText('Pages'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('welcome (Welcome)')
        .expect(Selector('h2').withText('Informed Consent').innerText).eql('consent (Informed Consent)');
});
