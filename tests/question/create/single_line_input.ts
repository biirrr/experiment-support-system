import { Selector } from 'testcafe';
import { request } from '../../util';

fixture(`Single-line input`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Create a required single-line input question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-line Input'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'What is your name?')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('What is your name?').innerText).eql('What is your name?')
        .expect(Selector('li.question input').exists).ok();
});

test('Create an optional single-line input question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-line Input'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'What is your name?')
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('What is your name?').innerText).eql('What is your name?')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question input').exists).ok();
});
