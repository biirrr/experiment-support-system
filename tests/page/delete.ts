import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Page Deletion`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2');
    await test
        .resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
});

test('Delete a page from an experiment', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .setNativeDialogHandler(() => true)
        .click(Selector('a').withText('Welcome').parent().parent().nextSibling().find('a[aria-label="Delete this page"'))
        .expect(Selector('a').withText('Welcome').exists).notOk();
});

test('Do not delete a page from an experiment on cancel', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .setNativeDialogHandler(() => false)
        .click(Selector('a').withText('Welcome').parent().parent().nextSibling().find('a[aria-label="Delete this page"'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('welcome (Welcome)');
});
