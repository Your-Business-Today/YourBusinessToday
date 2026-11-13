import { describe, expect, it } from 'vitest';
import { thingPageWordsOf } from './thingPageWords';

const jobPage = [
	'# Job',
	'',
	'A job is the work done for one client at one address,',
	'from the quote being accepted to the final invoice.',
	'',
	'Everything on site hangs off it.',
	'',
	'## What makes one',
	'An accepted quote.',
	'',
	'## Examples',
	'- The Elm Court kitchen refit',
	'* 14 Mill Lane, new sash windows',
	'',
	'3. A warranty call-back',
	'## Kept in',
	'The job book.'
].join('\n');

describe('thingPageWordsOf', () => {
	it('takes the first paragraph before the sections as what the thing is, leaving out the title', () => {
		const { opening } = thingPageWordsOf(jobPage);
		expect(opening).toBe('A job is the work done for one client at one address, from the quote being accepted to the final invoice.');
	});

	it('takes each line under Examples as one example, without its list mark, up to the next section', () => {
		const { examples } = thingPageWordsOf(jobPage);
		expect(examples).toEqual(['The Elm Court kitchen refit', '14 Mill Lane, new sash windows', 'A warranty call-back']);
	});

	it('has no opening and no examples when the page gives neither', () => {
		expect(thingPageWordsOf('## Kept in\nThe job book.')).toEqual({ opening: '', examples: [] });
	});
});
