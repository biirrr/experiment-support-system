import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Experiment`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=user1');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800);
});

test('Create a new experiment', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Test 1'))
        .click(Selector('.grid-container a').withText('Experiments'))
        .click(Selector('a[aria-label="Create a new experiment"]'))
        .expect(Selector('h1').innerText).eql('Create a new Experiment')
        .typeText(Selector('input[name="title"]'), 'Test Experiment')
        .typeText(Selector('textarea[name="description"]'), 'This is just a test experiment')
        .click(Selector('button').withText('Create'))
        .expect(Selector('h1').innerText).eql('Test Experiment');
});

test('Failed to create a experiment without title', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Test 1'))
        .click(Selector('.grid-container a').withText('Experiments'))
        .click(Selector('a[aria-label="Create a new experiment"]'))
        .expect(Selector('h1').innerText).eql('Create a new Experiment')
        .click(Selector('button').withText('Create'))
        .expect(Selector('input[name="title"] + span.form-error').innerText).eql('Empty values not allowed');
});
