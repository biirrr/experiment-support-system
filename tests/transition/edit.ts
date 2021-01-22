import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Transition Editing`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment2&obj=experiment7');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Re-order the transitions of a page (up)', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(1))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Move up'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok();
});

test('Re-order the transitions of a page (down)', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(0))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Move down'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok();
});

test('Switch a conditional transition to unconditional', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(1))
        .click(Selector('.transition-list label').withText('Transition Condition'))
        .click(Selector('.transition-list label').withText('Transition Condition').find('option').withAttribute('value', 'unconditional'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Save the transition'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time).').exists).ok();
});

test('Change the conditional question', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(0))
        .click(Selector('.transition-list label').withText('Page'))
        .click(Selector('.transition-list label').withText('Page').find('option').withAttribute('value', '4'))
        .click(Selector('.transition-list label').withText('Question'))
        .click(Selector('.transition-list label').withText('Question').find('option').withAttribute('value', '2'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Save the transition'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "email" on page participate (Thank you for participating) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok();
});

test('Change the conditional operator', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(0))
        .click(Selector('.transition-list label').withText('Operator'))
        .click(Selector('.transition-list label').withText('Operator').find('option').withAttribute('value', 'neq'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Save the transition'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok();
});

test('Change the conditional value', async(test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('.grid-container a').withText('Experiment 7'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Transitions'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consent".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok()
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Edit').nth(0))
        .typeText(Selector('.transition-list label').withText('Value').find('input'), 'ing')
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Save the transition'))
        .click(Selector('.transition-list a').withAttribute('aria-label', 'Close the editor'))
        .expect(Selector('.transition-list p').nth(0).withText('Transition to participate (Thank you for participating) if the answer to the question "consent" on page welcome (Welcome) is "consenting".').exists).ok()
        .expect(Selector('.transition-list p').nth(1).withText('Transition to leave (Thank you for your time) if the answer to the question "consent" on page welcome (Welcome) is not "consent".').exists).ok();
});
