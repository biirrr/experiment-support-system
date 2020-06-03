import { Selector } from 'testcafe'
import { request } from 'http'

fixture(`Page Edit`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
}).page('http://localhost:6543/');

test('Edit the settings of a page', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('.page-editor a').withText('Settings'))
        .selectText(Selector('label').withText('Name').find('input'))
        .pressKey('delete')
        .typeText(Selector('label').withText('Name').find('input'), 'page1')
        .selectText(Selector('label').withText('Title').find('input'))
        .pressKey('delete')
        .typeText(Selector('label').withText('Title').find('input'), 'Page 1')
        .click(Selector('button').withText('Update'))
        .click(Selector('a').withText('Pages'))
        .expect(Selector('h2').withText('Page 1').innerText).eql('page1 (Page 1)');
});

test('Edit the settings of a page with no changes', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('.page-editor a').withText('Settings'))
        .click(Selector('button').withText('Update'))
        .click(Selector('a').withText('Pages'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('welcome (Welcome)');
});

test('Fail to change name to name of another page', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('.page-editor a').withText('Settings'))
        .selectText(Selector('label').withText('Name').find('input'))
        .pressKey('delete')
        .typeText(Selector('label').withText('Name').find('input'), 'consent')
        .click(Selector('button').withText('Update'))
        .expect(Selector('label').withText('Name').hasClass('is-invalid-label')).ok()
        .expect(Selector('label').withText('Name').find('input').hasClass('is-invalid-input')).ok()
        .expect(Selector('label').withText('Name').find('span.form-error.is-visible').innerText).eql('Page names must be unique')
        .click(Selector('a').withText('Pages'))
        .expect(Selector('h2').withText('Welcome').innerText).eql('welcome (Welcome)');
});
