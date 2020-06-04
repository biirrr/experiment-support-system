import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Multi-line input`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
}).page('http://localhost:6543/');

test('Create a required multi-line input question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multi-line Input'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Describe yourself in a few words')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Describe yourself in a few words').innerText).eql('Describe yourself in a few words')
        .expect(Selector('li.question textarea').exists).ok();
});

test('Create an optional multi-line input question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multi-line Input'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Describe yourself in a few words')
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Describe yourself in a few words').innerText).eql('Describe yourself in a few words')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question textarea').exists).ok();
});
