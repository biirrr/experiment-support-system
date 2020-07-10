import { Selector } from 'testcafe';
import { request } from '../util';

fixture(`Frontend Conditional`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment4');
    await test.resizeWindow(1100, 800);
}).page('http://localhost:6543');

const h1 = Selector('h1');
const startExperiment = Selector('button').withText('Start');
const nextPage = Selector('button').withText('Next page');
const finishExperiment = Selector('button').withText('Finish');
const checkbox = Selector('input[type="checkbox"]');
const radio = Selector('input[type="radio"]');
const textarea = Selector('textarea')
const input = Selector('input')

test('Complete an experiment with conditional questions', async (test) => {
    await test
        .navigateTo('http://localhost:6543/run/experiment-4')
        .expect(h1.innerText).eql('Page 1 - Conditional on SingleChoice')
        .expect(Selector('p').withText('You selected A').exists).notOk()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-1').withAttribute('value', '0'))
        .expect(Selector('p').withText('You selected A').exists).ok()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-1').withAttribute('value', '1'))
        .expect(Selector('p').withText('You selected A').exists).notOk()
        .expect(Selector('p').withText('You selected B').exists).ok()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-1').withAttribute('value', '2'))
        .expect(Selector('p').withText('You selected A').exists).notOk()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).ok()
        .click(startExperiment)
        .expect(h1.innerText).eql('Page 2 - Conditional on MultiChoice')
        .expect(Selector('p').withText('You selected A').exists).notOk()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-5').withAttribute('value', '0'))
        .expect(Selector('p').withText('You selected A').exists).ok()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-5').withAttribute('value', '1'))
        .expect(Selector('p').withText('You selected A').exists).ok()
        .expect(Selector('p').withText('You selected B').exists).ok()
        .expect(Selector('p').withText('You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-5').withAttribute('value', '2'))
        .expect(Selector('p').withText('You selected A').exists).ok()
        .expect(Selector('p').withText('You selected B').exists).ok()
        .expect(Selector('p').withText('You selected C').exists).ok()
        .click(checkbox.withAttribute('name', 'question-5').withAttribute('value', '1'))
        .expect(Selector('p').withText('You selected A').exists).ok()
        .expect(Selector('p').withText('You selected B').exists).notOk()
        .expect(Selector('p').withText('You selected C').exists).ok()
        .click(nextPage)
        .expect(h1.innerText).eql('Page 3 - Conditional on Input')
        .expect(Selector('p').withText('That is correct').exists).notOk()
        .typeText(input.withAttribute('name', 'question-9'), '3')
        .expect(Selector('p').withText('That is correct').exists).ok()
        .typeText(input.withAttribute('name', 'question-9'), '5')
        .expect(Selector('p').withText('That is correct').exists).notOk()
        .click(nextPage)
        .expect(h1.innerText).eql('Page 4 - Conditional on SingleChoiceGrid')
        .expect(Selector('p').withText('Q1: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-11.q1').withAttribute('value', '0'))
        .expect(Selector('p').withText('Q1: You selected A').exists).ok()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-11.q1').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q1: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected B').exists).ok()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-11.q1').withAttribute('value', '2'))
        .expect(Selector('p').withText('Q1: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).ok()
        .click(radio.withAttribute('name', 'question-11.q2').withAttribute('value', '0'))
        .expect(Selector('p').withText('Q2: You selected A').exists).ok()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-11.q2').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q2: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected B').exists).ok()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(radio.withAttribute('name', 'question-11.q2').withAttribute('value', '2'))
        .expect(Selector('p').withText('Q2: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).ok()
        .click(nextPage)
        .expect(h1.innerText).eql('Page 5 - Conditional on MultiChoiceGrid')
        .expect(Selector('p').withText('Q1: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected A').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-18.q1').withAttribute('value', '0'))
        .expect(Selector('p').withText('Q1: You selected A').exists).ok()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-18.q1').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q1: You selected A').exists).ok()
        .expect(Selector('p').withText('Q1: You selected B').exists).ok()
        .expect(Selector('p').withText('Q1: You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-18.q1').withAttribute('value', '2'))
        .expect(Selector('p').withText('Q1: You selected A').exists).ok()
        .expect(Selector('p').withText('Q1: You selected B').exists).ok()
        .expect(Selector('p').withText('Q1: You selected C').exists).ok()
        .click(checkbox.withAttribute('name', 'question-18.q1').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q1: You selected A').exists).ok()
        .expect(Selector('p').withText('Q1: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q1: You selected C').exists).ok()
        .click(checkbox.withAttribute('name', 'question-18.q2').withAttribute('value', '0'))
        .expect(Selector('p').withText('Q2: You selected A').exists).ok()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-18.q2').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q2: You selected A').exists).ok()
        .expect(Selector('p').withText('Q2: You selected B').exists).ok()
        .expect(Selector('p').withText('Q2: You selected C').exists).notOk()
        .click(checkbox.withAttribute('name', 'question-18.q2').withAttribute('value', '2'))
        .expect(Selector('p').withText('Q2: You selected A').exists).ok()
        .expect(Selector('p').withText('Q2: You selected B').exists).ok()
        .expect(Selector('p').withText('Q2: You selected C').exists).ok()
        .click(checkbox.withAttribute('name', 'question-18.q2').withAttribute('value', '1'))
        .expect(Selector('p').withText('Q2: You selected A').exists).ok()
        .expect(Selector('p').withText('Q2: You selected B').exists).notOk()
        .expect(Selector('p').withText('Q2: You selected C').exists).ok()
        .click(finishExperiment)
        .expect(h1.innerText).eql('Responses saved');
});
