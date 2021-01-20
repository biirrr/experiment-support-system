import { Selector } from 'testcafe';
import { request, loadJSON } from '../util';

fixture(`Frontend Basic`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment3');
    await test
        .navigateTo('http://localhost:6543/')
        .resizeWindow(1100, 800);
});

const h1 = Selector('h1');
const startExperiment = Selector('button').withText('Start');
const nextPage = Selector('button').withText('Next page');
const finishExperiment = Selector('button').withText('Finish');
const checkbox = Selector('input[type="checkbox"]');
const radio = Selector('input[type="radio"]');
const textarea = Selector('textarea')
const input = Selector('input')

test('Complete a basic experiment', async (test) => {
    await test
        .navigateTo('http://localhost:6543/run/experiment-3')
        .expect(h1.innerText).eql('Welcome')
        .click(startExperiment)
        .expect(h1.innerText).eql('Informed Consent')
        .click(checkbox.withAttribute('name', /information/))
        .click(checkbox.withAttribute('name', /voluntary/))
        .click(checkbox.withAttribute('name', /understand/))
        .click(nextPage)
        .expect(h1.innerText).eql('About you')
        .click(radio.withAttribute('value', 'age1'))
        .click(checkbox.withAttribute('value', 'fishing'))
        .click(checkbox.withAttribute('value', 'swimming'))
        .click(nextPage)
        .expect(h1.innerText).eql('Task')
        .click(radio.withAttribute('name', /sad/).withAttribute('value', '0'))
        .click(radio.withAttribute('name', /happy/).withAttribute('value', '4'))
        .click(nextPage)
        .expect(h1.innerText).eql('Thank you')
        .typeText(textarea, 'That was very interesting')
        .typeText(input.withAttribute('type', 'text'), 'That was very interesting')
        .click(finishExperiment)
        .expect(h1.innerText).eql('Responses saved');
    await request('http://localhost:6543/tests/assert?obj=participant&test=count&value=1');
    const msg = await loadJSON(await request('http://localhost:6543/tests/assert?obj=participant&test=exist'));
    await test
        .expect(msg.type).eql('participants')
        .expect(msg.attributes).ok()
        .expect(msg.attributes.responses).ok()
        .expect(msg.attributes.responses['2']['3'].information[0]).eql('yes')
        .expect(msg.attributes.responses['2']['3'].voluntary[0]).eql('yes')
        .expect(msg.attributes.responses['2']['3'].understand[0]).eql('yes')
        .expect(msg.attributes.responses['3']['4']).eql('age1')
        .expect(msg.attributes.responses['3']['5']).eql(['fishing', 'swimming'])
        .expect(msg.attributes.responses['4']['6'].sad).eql('0')
        .expect(msg.attributes.responses['4']['6'].happy).eql('4')
        .expect(msg.attributes.responses['5']['7']).eql('That was very interesting')
        .expect(msg.attributes.responses['5']['8']).eql('That was very interesting');
});
