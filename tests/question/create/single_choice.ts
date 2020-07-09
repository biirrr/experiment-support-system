import { Selector } from 'testcafe';
import { request } from 'http';

fixture(`Single choice selection`).beforeEach(async (test) => {
    const req = request('http://localhost:6543/tests/create?obj=experiment1&obj=experiment2');
    req.end();
    await test.resizeWindow(1100, 800)
        .click(Selector('a').withText('Sign in'))
        .expect(Selector('h1').innerText).eql('Sign in')
        .typeText(Selector('input[name="email"]'), 'test1@example.com')
        .typeText(Selector('input[name="password"]'), 'test1')
        .click(Selector('button').withText('Sign in'))
}).page('http://localhost:6543/');

test('Create a required single choice dropdown question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('dropdown'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question select').exists).ok()
        .expect(Selector('li.question select').childElementCount).eql(3)
        .expect(Selector('li.question select option').nth(0).innerText).eql('under 18')
        .expect(Selector('li.question select option').nth(0).value).eql('0')
        .expect(Selector('li.question select option').nth(1).innerText).eql('18 - 65')
        .expect(Selector('li.question select option').nth(1).value).eql('1')
        .expect(Selector('li.question select option').nth(2).innerText).eql('over 65')
        .expect(Selector('li.question select option').nth(2).value).eql('2');
});

test('Create an optional single choice dropdown question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('dropdown'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question select').exists).ok()
        .expect(Selector('li.question select').childElementCount).eql(3)
        .expect(Selector('li.question select option').nth(0).innerText).eql('under 18')
        .expect(Selector('li.question select option').nth(0).value).eql('0')
        .expect(Selector('li.question select option').nth(1).innerText).eql('18 - 65')
        .expect(Selector('li.question select option').nth(1).value).eql('1')
        .expect(Selector('li.question select option').nth(2).innerText).eql('over 65')
        .expect(Selector('li.question select option').nth(2).value).eql('2');
});

test('Create a required single choice vertical list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('vertical list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question ul.no-bullet').childElementCount).eql(3)
        .expect(Selector('li.question li label').nth(0).innerText).eql(' under 18')
        .expect(Selector('li.question li input[type="radio"]').nth(0).value).eql('0')
        .expect(Selector('li.question li label').nth(1).innerText).eql(' 18 - 65')
        .expect(Selector('li.question li input[type="radio"]').nth(1).value).eql('1')
        .expect(Selector('li.question li label').nth(2).innerText).eql(' over 65')
        .expect(Selector('li.question li input[type="radio"]').nth(2).value).eql('2');
});

test('Create an optional single choice vertical list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('vertical list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question h2.required').exists).notOk()
        .expect(Selector('li.question ul.no-bullet').childElementCount).eql(3)
        .expect(Selector('li.question li label').nth(0).innerText).eql(' under 18')
        .expect(Selector('li.question li input[type="radio"]').nth(0).value).eql('0')
        .expect(Selector('li.question li label').nth(1).innerText).eql(' 18 - 65')
        .expect(Selector('li.question li input[type="radio"]').nth(1).value).eql('1')
        .expect(Selector('li.question li label').nth(2).innerText).eql(' over 65')
        .expect(Selector('li.question li input[type="radio"]').nth(2).value).eql('2');
});

test('Create a required single choice horizontal list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Required').find('input'))
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('horizontal list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2.required').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question table thead tr').childElementCount).eql(3)
        .expect(Selector('li.question table tbody tr').childElementCount).eql(3)
        .expect(Selector('li.question table thead th').nth(0).innerText).eql('under 18')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(0).value).eql('0')
        .expect(Selector('li.question table thead th').nth(1).innerText).eql('18 - 65')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(1).value).eql('1')
        .expect(Selector('li.question table thead th').nth(2).innerText).eql('over 65')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(2).value).eql('2');
});

test('Create an optional single choice horizontal list question', async (test) => {
    await test
        .click(Selector('a').withText('Experiments'))
        .click(Selector('a').withText('Experiment 2'))
        .click(Selector('a').withText('Pages'))
        .click(Selector('a').withText('Welcome'))
        .click(Selector('a').withText('Single-choice'))
        .expect(Selector('li.question').exists).ok()
        .click(Selector('li.question a[aria-label="Edit"]'))
        .typeText(Selector('label').withText('Title').find('input'), 'Select your age')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(0), '0')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(1), '1')
        .click(Selector('label').withText('Values').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Values').nextSibling().find('input').nth(2), '2')
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(0), 'under 18', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(1), '18 - 65', {paste: true})
        .click(Selector('label').withText('Labels').nextSibling().find('a[aria-label="Add a value"]'))
        .typeText(Selector('label').withText('Labels').nextSibling().find('input').nth(2), 'over 65', {paste: true})
        .click(Selector('label').withText('Display').find('select'))
        .click(Selector('label').withText('Display').find('select option').withText('horizontal list'))
        .click(Selector('li.question a[aria-label="Save the question"]'))
        .click(Selector('li.question a[aria-label="Close the editor"]'))
        .expect(Selector('li.question h2').withText('Select your age').innerText).eql('Select your age')
        .expect(Selector('li.question table thead tr').childElementCount).eql(3)
        .expect(Selector('li.question table tbody tr').childElementCount).eql(3)
        .expect(Selector('li.question table thead th').nth(0).innerText).eql('under 18')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(0).value).eql('0')
        .expect(Selector('li.question table thead th').nth(1).innerText).eql('18 - 65')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(1).value).eql('1')
        .expect(Selector('li.question table thead th').nth(2).innerText).eql('over 65')
        .expect(Selector('li.question table tbody td input[type="radio"]').nth(2).value).eql('2');
});
