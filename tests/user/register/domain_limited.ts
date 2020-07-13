import { Selector } from 'testcafe';
import { request } from '../../util';

fixture(`Domain Limited Registration`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?setting=registration.mode:domain&setting=registration.domains:example.com');
    await test
        .resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/');
});

test('Successful registration', async (test) => {
    await test
        .click(Selector('a').withText('Sign up'))
        .expect(Selector('h1').innerText).eql('Sign up')
        .typeText(Selector('input[name="email"]'), 'test@example.com')
        .typeText(Selector('input[name="name"]'), 'Test Person')
        .click(Selector('.verification label:nth-child(1)'))
        .click(Selector('button').withText('Sign up'))
        .expect(Selector('li').withText('You have registered. You should shortly receive a confirmation e-mail.').innerText).eql('You have registered. You should shortly receive a confirmation e-mail.');
    const validationToken = (await Selector('li').withText('Validation token:').innerText).substring(18);
    await test
        .navigateTo('http://localhost:6543//users/confirm/test@example.com/' + validationToken)
        .expect(Selector('h1').innerText).eql('Set your Password')
        .typeText(Selector('input[name="password"]'), 'test')
        .typeText(Selector('input[name="confirm_password"]'), 'test')
        .click(Selector('button').withText('Set your Password'))
        .expect(Selector('li').withText('You have updated your password.').innerText).eql('You have updated your password.');
});

test('Failed registration', async (test) => {
    await test
        .click(Selector('a').withText('Sign up'))
        .expect(Selector('h1').innerText).eql('Sign up')
        .typeText(Selector('input[name="email"]'), 'test@evil.com')
        .typeText(Selector('input[name="name"]'), 'Test Person')
        .click(Selector('.verification label:nth-child(1)'))
        .click(Selector('button').withText('Sign up'))
        .expect(Selector('input[name="email"] + span.form-error').innerText).eql('Registration is only allowed for the following domains: example.com')
});
