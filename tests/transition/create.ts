import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Transition Creation`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2&obj=experiment7');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Create an unconditional transition', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Informed Consent'))
        .expect(Selector('h2').withText('Informed Consent').innerText).eql('Informed Consent')
        .click(Selector('a').withText('Transitions'))
        .click(Selector('button').withText('Add a transition'))
        .click(Selector('label').withText('Transition to'))
        .click(Selector('option').withAttribute('value', '1'))
        .click(Selector('button').withText('Add transition'))
        .expect(Selector('p').withText('Transition to welcome (Welcome).').exists).ok()
});

test('Create a conditional upon answer transition', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Thank you for participating'))
        .expect(Selector('h2').withText('Thank you for participating').innerText).eql('Thank you for participating')
        .click(Selector('a').withText('Transitions'))
        .click(Selector('button').withText('Add a transition'))
        .click(Selector('label').withText('Transition to'))
        .click(Selector('option').withAttribute('value', '5'))
        .click(Selector('label').withText('Transition Condition'))
        .click(Selector('label').withText('Transition Condition').find('option').withAttribute('value', 'answer'))
        .click(Selector('label').withText('Page'))
        .click(Selector('label').withText('Page').find('option').withAttribute('value', '3'))
        .click(Selector('label').withText('Question'))
        .click(Selector('label').withText('Question').find('option').withAttribute('value', '1'))
        .click(Selector('label').withText('Operator'))
        .click(Selector('label').withText('Operator').find('option').withAttribute('value', 'eq'))
        .typeText(Selector('label').withText('Value').find('input'), 'consent')
        .click(Selector('button').withText('Add transition'))
        .expect(Selector('p').withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok();
});
