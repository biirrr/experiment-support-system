import { Selector } from 'testcafe'
import { request } from 'http'

fixture(`Login`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=user1');
    req.end();
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543/');

test('Successful login', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
        .expect(Selector('a').withText('Sign out').innerText).eql('Sign out');
});

test('Failed login 1', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .expect(Selector('input[name="email"] + span.form-error').innerText).eql('Either there is no user with this e-mail address or the password is incorrect.')
        .expect(Selector('input[name="password"] + span.form-error').innerText).eql('Either there is no user with this e-mail address or the password is incorrect.');
})

test('Failed login 2', async (test) => {
    await test
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .expect(Selector('input[name="email"] + span.form-error').innerText).eql('Either there is no user with this e-mail address or the password is incorrect.')
        .expect(Selector('input[name="password"] + span.form-error').innerText).eql('Either there is no user with this e-mail address or the password is incorrect.');
});
