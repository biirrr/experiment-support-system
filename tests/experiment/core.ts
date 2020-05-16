import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=user1');
    req.end();
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543/');

test('Create a new experiment', async (test) => {
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
    await test.click(Selector('a').withText('Test 1'))
    await test.click(Selector('.grid-container a').withText('Experiments'))
    await test.click(Selector('a[aria-label="Create a new experiment"]'))
    await test.expect(Selector('h1').innerText).eql('Create a new Experiment')
    await test.typeText(Selector('input[name="title"]'), 'Test Experiment');
    await test.typeText(Selector('textarea[name="description"]'), 'This is just a test experiment');
    await test.click(Selector('button').withText('Create'));
    await test.expect(Selector('h1').innerText).eql('Test Experiment')
});

test('Failed to create a experiment without title', async (test) => {
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
    await test.click(Selector('a').withText('Test 1'))
    await test.click(Selector('.grid-container a').withText('Experiments'))
    await test.click(Selector('a[aria-label="Create a new experiment"]'))
    await test.expect(Selector('h1').innerText).eql('Create a new Experiment')
    await test.click(Selector('button').withText('Create'));
    await test.expect(Selector('input[name="title"] + span.form-error').innerText).eql('Empty values not allowed');
});
