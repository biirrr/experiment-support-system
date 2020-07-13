import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`User Profile`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=user1');
    await test
        .resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/');
});

test('Access the profile page', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Test 1'))
        .expect(Selector('h1').innerText).eql('Test 1');
});
