import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Experiment Status`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment3&obj=experiment5');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'));
});

test('Switch development to live', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 5'))
        .expect(Selector('h1').withText('Experiment 5').innerText).eql('Experiment 5')
        .expect(Selector('select').value).eql('development')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).eql('Test the Experiment')
        .setNativeDialogHandler((type, text, url) => {
            return true;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'live'))
        .expect(Selector('option').withAttribute('value', 'development').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).ok()
        .expect(Selector('option').withAttribute('value', 'completed').exists).ok()
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://');
});

test('Cancel switch development to live', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 5'))
        .expect(Selector('h1').withText('Experiment 5').innerText).eql('Experiment 5')
        .expect(Selector('select').value).eql('development')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).eql('Test the Experiment')
        .setNativeDialogHandler((type, text, url) => {
            return false;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'live'))
        .expect(Selector('option').withAttribute('value', 'development').exists).ok()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'completed').exists).notOk()
        .expect(Selector('select').value).eql('development')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).eql('Test the Experiment');
});

test('Switch live to paused', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .expect(Selector('h1').withText('Experiment 3').innerText).eql('Experiment 3')
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://')
        .setNativeDialogHandler((type, text, url) => {
            return true;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'paused'))
        .expect(Selector('option').withAttribute('value', 'development').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).ok()
        .expect(Selector('option').withAttribute('value', 'completed').exists).ok()
        .expect(Selector('select').value).eql('paused');
});

test('Switch paused to live', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .expect(Selector('h1').withText('Experiment 3').innerText).eql('Experiment 3')
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://')
        .setNativeDialogHandler((type, text, url) => {
            return true;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'paused'))
        .expect(Selector('option').withAttribute('value', 'development').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).ok()
        .expect(Selector('option').withAttribute('value', 'completed').exists).ok()
        .expect(Selector('select').value).eql('paused')
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'live'))
        .expect(Selector('option').withAttribute('value', 'development').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).ok()
        .expect(Selector('option').withAttribute('value', 'completed').exists).ok()
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://');
});

test('Switch live to completed', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .expect(Selector('h1').withText('Experiment 3').innerText).eql('Experiment 3')
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://')
        .setNativeDialogHandler((type, text, url) => {
            return true;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'completed'))
        .expect(Selector('select').exists).notOk();
});

test('Cancel switch live to completed', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .expect(Selector('h1').withText('Experiment 3').innerText).eql('Experiment 3')
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://')
        .setNativeDialogHandler((type, text, url) => {
            return false;
        })
        .click(Selector('select'))
        .click(Selector('option').withAttribute('value', 'completed'))
        .expect(Selector('option').withAttribute('value', 'development').exists).notOk()
        .expect(Selector('option').withAttribute('value', 'live').exists).ok()
        .expect(Selector('option').withAttribute('value', 'paused').exists).ok()
        .expect(Selector('option').withAttribute('value', 'completed').exists).ok()
        .expect(Selector('select').value).eql('live')
        .expect(Selector('a').withAttribute('target', '_blank').innerText).contains('http://');
});
