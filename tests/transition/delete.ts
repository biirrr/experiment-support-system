import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Transition Deletion`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2&obj=experiment7');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Delete a transition', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('Welcome')
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('p').withText('Transition to consent (Informed Consent).').exists).ok()
        .click(Selector('.transition-list section:nth-of-type(1) a').withAttribute('aria-label', 'Edit'))
        .setNativeDialogHandler(() => {
            return true;
        })
        .click(Selector('.transition-list section:nth-of-type(1) a').withAttribute('aria-label', 'Delete'))
        .expect(Selector('p').withText('Transition to consent (Informed Consent).').exists).notOk()
});

test('Cancel delete a transition', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('Welcome')
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('p').withText('Transition to consent (Informed Consent).').exists).ok()
        .click(Selector('.transition-list section:nth-of-type(1) a').withAttribute('aria-label', 'Edit'))
        .setNativeDialogHandler(() => {
            return false;
        })
        .click(Selector('.transition-list section:nth-of-type(1) a').withAttribute('aria-label', 'Delete'))
        .click(Selector('.transition-list section:nth-of-type(1) a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('p').withText('Transition to consent (Informed Consent).').exists).ok()
});
