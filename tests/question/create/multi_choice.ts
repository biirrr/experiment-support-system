import { Selector } from 'testcafe';
import { request } from '../../util';

fixture(`Multiple choice selection`).beforeEach(async (test) => {
    await request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    await test.resizeWindow(1100, 800)
        .navigateTo('http://localhost:6543/')
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
});

test('Create a required multiple choice dropdown question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('multiselect'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question select').exists).ok()
        .expect(Selector('li.question select').childElementCount).eql(3)
        .expect(Selector('li.question select option').nth(0).innerText).eql('Skiing')
        .expect(Selector('li.question select option').nth(0).value).eql('skiing')
        .expect(Selector('li.question select option').nth(1).innerText).eql('Surfing')
        .expect(Selector('li.question select option').nth(1).value).eql('surfing')
        .expect(Selector('li.question select option').nth(2).innerText).eql('Walking')
        .expect(Selector('li.question select option').nth(2).value).eql('walking');
});

test('Create an optional multiple choice dropdown question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('multiselect'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question select').exists).ok()
        .expect(Selector('li.question select').childElementCount).eql(3)
        .expect(Selector('li.question select option').nth(0).innerText).eql('Skiing')
        .expect(Selector('li.question select option').nth(0).value).eql('skiing')
        .expect(Selector('li.question select option').nth(1).innerText).eql('Surfing')
        .expect(Selector('li.question select option').nth(1).value).eql('surfing')
        .expect(Selector('li.question select option').nth(2).innerText).eql('Walking')
        .expect(Selector('li.question select option').nth(2).value).eql('walking');
});

test('Create a required multiple choice vertical list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('vertical list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question ul.no-bullet').childElementCount).eql(3)
        .expect(Selector('li.question li label').nth(0).innerText).eql(' Skiing')
        .expect(Selector('li.question li input[type="checkbox"]').nth(0).value).eql('skiing')
        .expect(Selector('li.question li label').nth(1).innerText).eql(' Surfing')
        .expect(Selector('li.question li input[type="checkbox"]').nth(1).value).eql('surfing')
        .expect(Selector('li.question li label').nth(2).innerText).eql(' Walking')
        .expect(Selector('li.question li input[type="checkbox"]').nth(2).value).eql('walking');
});

test('Create an optional multiple choice vertical list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('vertical list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question ul.no-bullet').childElementCount).eql(3)
        .expect(Selector('li.question li label').nth(0).innerText).eql(' Skiing')
        .expect(Selector('li.question li input[type="checkbox"]').nth(0).value).eql('skiing')
        .expect(Selector('li.question li label').nth(1).innerText).eql(' Surfing')
        .expect(Selector('li.question li input[type="checkbox"]').nth(1).value).eql('surfing')
        .expect(Selector('li.question li label').nth(2).innerText).eql(' Walking')
        .expect(Selector('li.question li [type="checkbox"]').nth(2).value).eql('walking');
});

test('Create a required multiple choice horizontal list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('horizontal list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question table thead tr').childElementCount).eql(3)
        .expect(Selector('li.question table tbody tr').childElementCount).eql(3)
        .expect(Selector('li.question table thead th').nth(0).innerText).eql('Skiing')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(0).value).eql('skiing')
        .expect(Selector('li.question table thead th').nth(1).innerText).eql('Surfing')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(1).value).eql('surfing')
        .expect(Selector('li.question table thead th').nth(2).innerText).eql('Walking')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(2).value).eql('walking');
});

test('Create an optional multiple choice horizontal list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Multiple-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your interests')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), 'skiing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), 'surfing', {paste: true})
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), 'walking', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'Skiing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), 'Surfing', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'Walking', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('horizontal list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your interests').innerText).eql('Select your interests')
        .expect(Selector('li.question table thead tr').childElementCount).eql(3)
        .expect(Selector('li.question table tbody tr').childElementCount).eql(3)
        .expect(Selector('li.question table thead th').nth(0).innerText).eql('Skiing')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(0).value).eql('skiing')
        .expect(Selector('li.question table thead th').nth(1).innerText).eql('Surfing')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(1).value).eql('surfing')
        .expect(Selector('li.question table thead th').nth(2).innerText).eql('Walking')
        .expect(Selector('li.question table tbody td input[type="checkbox"]').nth(2).value).eql('walking');
});
