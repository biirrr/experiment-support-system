import { Selector } from 'testcafe';
import { request } from '../../util';

fixture(`Admin Limited Registration`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?setting=registration.mode:admin');
    await test
        .resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/');
});

test('Failed registration', async (test) => {
    await test
        .expect(Selector('a').withText('Sign up').exists).notOk()
        .navigateTo('http://localhost:6543//users/register')
        .expect(Selector('ul.flash li.error').withText('Only an administrator can register a new user').innerText).eql('Only an administrator can register a new user');
});
