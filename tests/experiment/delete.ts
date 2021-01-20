import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Experiment`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment1');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
});

test('Delete experiment', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Actions'))
        .setNativeDialogHandler((type, text, url) => {
            if (type == 'confirm') {
                return true;
            }
        })
        .click(Selector('button').withText('Delete this Experiment'))
        .click(Selector('a').withText('Experiments'))
        .expect(Selector('a').withText('Experiment 1').exists).notOk();
});

test('Cancel Delete experiment', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Actions'))
        .setNativeDialogHandler((type, text, url) => {
            if (type == 'confirm') {
                return false;
            }
        })
        .click(Selector('button').withText('Delete this Experiment'))
        .click(Selector('a').withText('Experiments'))
        .expect(Selector('a').withText('Experiment 1').exists).ok();
});
