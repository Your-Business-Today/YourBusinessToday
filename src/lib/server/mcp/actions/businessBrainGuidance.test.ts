import { describe, expect, it } from 'vitest';
import { brainAction } from './businessBrainReadingFixtures';

const readsThatJudge = ['search_business_brain', 'read_business_brain_page'];

type SchemaProperty = { type?: string };

function propertiesOf(actionName: string): SchemaProperty[] {
	const schema = brainAction(actionName).inputSchema as { properties: Record<string, SchemaProperty> };
	return Object.values(schema.properties);
}

function expectJudgingGuidance(words: string) {
	for (const name of readsThatJudge) {
		expect(brainAction(name).guidance).toContain(words);
	}
}

describe('judging a photo against Your Business Brain', () => {
	it('keeps the photo with Claude and sends only words', () => {
		expectJudgingGuidance('Your Business Today never sees it');
		expectJudgingGuidance('send only those words');
		expectJudgingGuidance('Never upload or file a photo you are judging');
		for (const name of readsThatJudge) {
			expect(propertiesOf(name).map((property) => property.type)).toEqual(propertiesOf(name).map(() => 'string'));
		}
	});

	it('judges one observation at a time against pages read whole', () => {
		expectJudgingGuidance('Judge one observation at a time');
		expectJudgingGuidance('read whole every page that bears on it before judging');
	});

	it('names the rule broken and the page behind every finding', () => {
		expectJudgingGuidance('not in order, with the rule it breaks');
		expectJudgingGuidance('cannot be judged, because the photo does not show enough to tell');
		expectJudgingGuidance('title and page id of the page behind every finding');
	});

	it('says the brain is silent rather than guessing a rule', () => {
		expectJudgingGuidance('Judge only against rules the brain holds');
		expectJudgingGuidance('say the brain is silent on it and give no verdict');
	});
});
