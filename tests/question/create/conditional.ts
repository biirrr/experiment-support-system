import { Selector } from 'testcafe';
import { request } from '../../util';

fixture(`Conditional Questions`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment3');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Create a static html text question with a condition based on a single-choice value', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('About you'))
        .hover(Selector('li.question:nth-child(1)'))
        .click(Selector('li.question:nth-child(1) a[aria-label="Insert a question after this question"]'))
        .click(Selector('a').withText('Static Text Display'))
        .expect(Selector('li.question:nth-child(2)').exists).ok()
        .click(Selector('li.question:nth-child(2) a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Content').find('textarea'), '<p>You are unfortunately to young to participate.</p>')
        .click(Selector('label').withText('Data-format').find('select'))
        .click(Selector('label').withText('Data-format').find('select option[value="text/html"]'))
        .click(Selector('label').withText('Conditionally Display').parent().find('select'))
        .click(Selector('label').withText('Conditionally Display').parent().find('select option[value="4"]'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(2) > select'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(2) > select > option[value="eq"]'))
        .typeText(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(3) > input'), 'age0')
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question p').withText('You are unfortunately to young to participate.').innerText).eql('You are unfortunately to young to participate.');
});

test('Create a static html text question with a condition based on a multi-choice-grid', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 3'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Informed Consent'))
        .hover(Selector('li.question:nth-child(2)'))
        .click(Selector('li.question:nth-child(2) a[aria-label="Insert a question after this question"]'))
        .click(Selector('a').withText('Static Text Display'))
        .expect(Selector('li.question:nth-child(3)').exists).ok()
        .click(Selector('li.question:nth-child(3) a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Content').find('textarea'), '<p>Good that you are doing this voluntarily.</p>')
        .click(Selector('label').withText('Data-format').find('select'))
        .click(Selector('label').withText('Data-format').find('select option[value="text/html"]'))
        .click(Selector('label').withText('Conditionally Display').parent().find('select'))
        .click(Selector('label').withText('Conditionally Display').parent().find('select option[value="3"]'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(2) > select'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(2) > select > option[value="information"]'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(3) > select'))
        .click(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(3) > select > option[value="eq"]'))
        .typeText(Selector('label').withText('Conditionally Display').parent().find('div:nth-child(4) > input'), 'yes')
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question p').withText('Good that you are doing this voluntarily.').innerText).eql('Good that you are doing this voluntarily.');
});
