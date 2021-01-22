import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Transition Access`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2&obj=experiment7');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Access the transitions of a page with transitions', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('Welcome')
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('p').withText('Transition to consent (Informed Consent).').exists).ok();
});

test('Access the transitions of a page without transitions', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Informed Consent'))
        .expect(Selector('h2').withText('Informed Consent').innerText).eql('Informed Consent')
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('label').withText('Transition to').exists).notOk();
});

test('Access the transitions of a page with conditional transitions', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('p').withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('p').withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok();
});
