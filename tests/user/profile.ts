import { Selector } from 'testcafe'
import { request } from 'http'

fixture(`User Profile`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=user1');
    req.end();
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543/');

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
