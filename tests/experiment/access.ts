import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Experiment`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800);
    await test.resizeWindow(1100, 800);
    await test.click(Selector('a').withText('Sign in'));
    await test.expect(Selector('h1').innerText).eql('Sign in');
    await test.typeText(Selector('input[name="email"]'), 'test1@example.com');
    await test.typeText(Selector('input[name="password"]'), 'test1');
    await test.click(Selector('button').withText('Sign in'));
}).page('http://localhost:6543/');

test('Access experiment 1', async (test) => {
    await test.click(Selector('a').withText('Experiments'));
    await test.click(Selector('a').withText('Test 1'));
    await test.expect(Selector('h1').withText('Test 1').innerText).eql('Test 1');
});

test('Access experiment 2', async (test) => {
    await test.click(Selector('a').withText('Experiments'));
    await test.click(Selector('a').withText('Test 2'));
    await test.expect(Selector('h1').withText('Test 2').innerText).eql('Test 2');
    await test.click(Selector('a').withText('Pages'));
    await test.expect(Selector('h2').withText('Welcome').innerText).eql('welcome (Welcome)');
    await test.expect(Selector('h2').withText('Informed Consent').innerText).eql('consent (Informed Consent)');
});
