import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Static text`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
}).page('http://localhost:6543/');

test('Create a static html text question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Text Display'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Content').find('textarea'), '<p>Welcome to this experiment.</p>')
        .click(Selector('label').withText('Format').find('select'))
        .click(Selector('label').withText('Format').find('select option[value="text/html"]'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question p').withText('Welcome to this experiment.').innerText).eql('Welcome to this experiment.');
});

test('Create a static text question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Text Display'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Content').find('textarea'), 'Welcome to this experiment.')
        .click(Selector('label').withText('Format').find('select'))
        .click(Selector('label').withText('Format').find('select option[value="text/text"]'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question div').withText('Welcome to this experiment.').innerText).eql('Welcome to this experiment.');
});
