import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=user1');
    req.end();
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543/');

test('Access the profile page', async (test) => {
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
    await test.click(Selector('a').withText('Test 1'))
    await test.expect(Selector('h1').innerText).eql('Test 1')
});
