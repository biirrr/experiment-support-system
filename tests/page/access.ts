import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800);
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
}).page('http://localhost:6543/');

test('Access all pages in an experiment', async (test) => {
    await test.click(Selector('a').withText('Experiments'))
    await test.click(Selector('.grid-container a').withText('Experiment 2'))
    await test.click(Selector('a').withText('Pages'))
    await test.click(Selector('a').withText('Welcome'))
    await test.expect(Selector('h2').withText('Welcome').innerText).eql('Welcome');
    await test.click(Selector('a').withText('Pages'))
    await test.click(Selector('a').withText('Informed Consent'))
    await test.expect(Selector('h2').withText('Informed Consent').innerText).eql('Informed Consent');
});
