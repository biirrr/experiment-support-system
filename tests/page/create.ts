import { Selector } from 'testcafe'
import { request } from 'http'

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1');
    req.end();
    await test
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
}).page('http://localhost:6543/');

test('Add a page to an experiment', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 1'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Add a page'))
        .typeText(Selector('label').withText('Name').find('input'), 'page1')
        .typeText(Selector('label').withText('Title').find('input'), 'Page 1')
        .click(Selector('button').withText('Add'))
        .expect(Selector('h2').withText('Page 1').innerText).eql('Page 1');
});
