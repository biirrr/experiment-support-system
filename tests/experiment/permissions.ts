import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Experiment`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2&obj=user2&obj=experiment5');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
});

test('Access limited experiment 1', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1');
    await test
        .click(Selector('a').withText('Sign out'))
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Experiments'))
        .expect(Selector('a').withText('Experiment 1').exists).notOk()
        .navigateTo('http://localhost:6543/experiments/1/edit')
        .expect(Selector('h1').withText('403 - Forbidden').exists).ok();
});

test('Cannot delete single owner', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1')
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Permissions'))
        .expect(Selector('svg').withAttribute('aria-label', 'This permission cannot be deleted')).ok()
        .expect(Selector('p').withText('This user owns this experiment').innerText).eql('This user owns this experiment. As there is only one owner, this cannot be changed.');
});

test('Add an author', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1')
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Permissions'))
        .expect(Selector('svg').withAttribute('aria-label', 'This permission cannot be deleted')).ok()
        .expect(Selector('p').withText('This user owns this experiment').innerText).eql('This user owns this experiment. As there is only one owner, this cannot be changed.')
        .click(Selector('button').withText('Add permission'))
        .expect(Selector('button').withText("Don't add permission").exists).ok()
        .typeText(Selector('input[type="text"]'), 'test')
        .expect(Selector('ul.no-bullet > li > a').withText('Test 1').exists).notOk()
        .click(Selector('a').withText('Test 2'))
        .expect(Selector('ul.no-bullet.no-margin > li').childNodeCount).eql(2)
        .expect(Selector('.settings-permissions select').value).eql('author');
    await test
        .click(Selector('a').withText('Sign out'))
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1')
        .click(Selector('a').withText('Settings'))
        .expect(Selector('a').withText('Permissions').exists).notOk();
});

test('Add an owner', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1')
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Permissions'))
        .expect(Selector('svg').withAttribute('aria-label', 'This permission cannot be deleted').exists).ok()
        .expect(Selector('p').withText('This user owns this experiment').innerText).eql('This user owns this experiment. As there is only one owner, this cannot be changed.')
        .click(Selector('button').withText('Add permission'))
        .expect(Selector('button').withText("Don't add permission").exists).ok()
        .typeText(Selector('input[type="text"]'), 'test')
        .expect(Selector('ul.no-bullet > li > a').withText('Test 1').exists).notOk()
        .click(Selector('a').withText('Test 2'))
        .expect(Selector('ul.no-bullet.no-margin > li').childNodeCount).eql(2)
        .click(Selector('.settings-permissions select'))
        .click(Selector('option').withAttribute('value', 'owner'))
        .expect(Selector('.settings-permissions select').count).eql(2)
        .expect(Selector('svg').withAttribute('aria-label', 'This permission cannot be deleted').exists).notOk()
    await test
        .click(Selector('a').withText('Sign out'))
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 1'))
        .expect(Selector('h1').withText('Experiment 1').innerText).eql('Experiment 1')
        .click(Selector('a').withText('Settings'))
        .expect(Selector('a').withText('Permissions').exists).ok();
});

test('Add a tester', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 5'))
        .expect(Selector('h1').withText('Experiment 5').innerText).eql('Experiment 5')
        .click(Selector('a').withText('Settings'))
        .click(Selector('a').withText('Permissions'))
        .expect(Selector('svg').withAttribute('aria-label', 'This permission cannot be deleted').exists).ok()
        .expect(Selector('p').withText('This user owns this experiment').innerText).eql('This user owns this experiment. As there is only one owner, this cannot be changed.')
        .click(Selector('button').withText('Add permission'))
        .expect(Selector('button').withText("Don't add permission").exists).ok()
        .typeText(Selector('input[type="text"]'), 'test')
        .expect(Selector('ul.no-bullet > li > a').withText('Test 2').exists).ok()
        .click(Selector('a').withText('Test 2'))
        .expect(Selector('ul.no-bullet.no-margin > li').childNodeCount).eql(2)
        .click(Selector('.settings-permissions select'))
        .click(Selector('option').withAttribute('value', 'tester'));
    await test
        .click(Selector('a').withText('Sign out'))
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .click(Selector('a').withText('Experiments'))
        .expect(Selector('a').withText('Experiment 5').exists).notOk()
        .click(Selector('a').withText('Test the Experiment'))
        .expect(Selector('h1').innerText).eql('Welcome');
});

test('Development experiments are not publicly accessible', async (test) => {
    await test
        .click(Selector('a').withText('Sign out'))
        .navigateTo('http://localhost:6543/run/experiment-5')
        .expect(Selector('h1').withText('404 - Not Found').exists).ok();
    await test
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test2@example.com')
        .typeText(Selector('input[name="password"]'), 'test2')
        .click(Selector('button').withText('Sign in'))
        .navigateTo('http://localhost:6543/run/experiment-5')
        .expect(Selector('h1').withText('404 - Not Found').exists).ok();
});
