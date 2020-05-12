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
    await test.expect(Selector('li').withText('You have registered. You should shortly receive a confirmation e-mail.').innerText).eql('You have registered. You should shortly receive a confirmation e-mail.')
    const validationToken = (await Selector('li').withText('Validation token:').innerText).substring(18);
    await test.navigateTo('http://localhost:6543//users/confirm/test@example.com/' + validationToken);
    await test.expect(Selector('h1').innerText).eql('Set your Password');
    await test.typeText(Selector('input[name="password"]'), 'test');
    await test.typeText(Selector('input[name="confirm_password"]'), 'test');
    await test.click(Selector('button').withText('Set your Password'));
    await test.expect(Selector('li').withText('You have updated your password.').innerText).eql('You have updated your password.')
});

test('Validation token failure', async (test) => {
    await test.click(Selector('a').withText('Sign up'));
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.typeText(Selector('input[name="email"]'), 'test@example.com');
    await test.typeText(Selector('input[name="name"]'), 'Test Person');
    await test.click(Selector('.verification label:nth-child(1)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.expect(Selector('li').withText('You have registered. You should shortly receive a confirmation e-mail.').innerText).eql('You have registered. You should shortly receive a confirmation e-mail.')
    await test.navigateTo('http://localhost:6543//users/confirm/test@example.com/abcde12345');
    await test.expect(Selector('li').withText('Unfortunately that validation token is not valid for that e-mail address.').innerText).eql('Unfortunately that validation token is not valid for that e-mail address.')
});

test('Invalid field values', async (test) => {
    await test.click(Selector('a').withText('Sign up'));
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.click(Selector('.verification label:nth-child(2)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.expect(Selector('input[name="email"] + span.form-error').innerText).eql('The email address is not valid. it must have exactly one @-sign.');
    await test.expect(Selector('input[name="name"] + span.form-error').innerText).eql('Empty values not allowed');
    await test.expect(Selector('p.is-invalid-label').innerText).contains('Please select the image that looks most like a');
});

test('Invalid email value', async (test) => {
    await test.click(Selector('a').withText('Sign up'));
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.typeText(Selector('input[name="email"]'), 'bla@bla');
    await test.typeText(Selector('input[name="name"]'), 'Test');
    await test.click(Selector('.verification label:nth-child(1)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.expect(Selector('input[name="email"] + span.form-error').innerText).eql('The domain name bla is not valid. it should have a period.');
});

test('Invalid existing email', async (test) => {
    await test.click(Selector('a').withText('Sign up'));
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.typeText(Selector('input[name="email"]'), 'test@example.com');
    await test.typeText(Selector('input[name="name"]'), 'Test');
    await test.click(Selector('.verification label:nth-child(1)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.navigateTo('http://localhost:6543//users/register');
    await test.expect(Selector('h1').innerText).eql('Sign up');
    await test.typeText(Selector('input[name="email"]'), 'test@example.com');
    await test.typeText(Selector('input[name="name"]'), 'Test');
    await test.click(Selector('.verification label:nth-child(1)'));
    await test.click(Selector('button').withText('Sign up'));
    await test.expect(Selector('input[name="email"] + span.form-error').innerText).eql('This e-mail address is already registered.');
});
