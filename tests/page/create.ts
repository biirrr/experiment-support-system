import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1');
    req.end();
    await test.resizeWindow(1100, 800);
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
}).page('http://localhost:6543/');

test('Add a page to an experiment', async (test) => {
    await test.click(Selector('a').withText('Experiments'))
    await test.click(Selector('.grid-container a').withText('Test 1'))
    await test.click(Selector('a').withText('Pages'))
    await test.click(Selector('a').withText('Add a page'))
    await test.typeText(Selector('label').withText('Name').find('input'), 'page1');
    await test.typeText(Selector('label').withText('Title').find('input'), 'Page 1');
    await test.click(Selector('button').withText('Add'));
    await test.expect(Selector('h2').withText('Page 1').innerText).eql('Page 1');
});
