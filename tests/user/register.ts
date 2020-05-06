import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Registration`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create');
    req.end();
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543/');

test('Successful registration', async (test) => {
    await test.click(Selector('a').withText('Sign up'));
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.typeText(Selector('input[name="email"]'), 'test@example.com');
    await test.typeText(Selector('input[name="name"]'), 'Test Person');
    await test.click(Selector('.verification label:nth-child(1)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.expect(Selector('li').withText('You have registered. You should shortly receive a confirmation e-mail.')).ok();
});
