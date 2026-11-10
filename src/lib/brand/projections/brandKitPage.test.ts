import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { brandKitPageOf } from './brandKitPage';
import { builtInTraits } from '../traits/traitCatalogue';
import { everywherePath, type Medium } from '../mediums/mediumDefinition';
import { findMedium } from '../mediums/mediumCatalogue';
import { resolveBrand } from '../resolution/resolveBrand';
import type { Decision } from '../decisions/decision';

const everywhere = findMedium(everywherePath) as Medium;
const primary = { ...adoptedDecision('look.colour.primary', everywherePath, '#0a2540'), rationale: 'The colour of the shopfront' };
const kitDecisions: Decision[] = [
	primary,
	adoptedDecision('look.type.bodyFamily', everywherePath, 'Inter'),
	adoptedDecision('look.shape.radius', everywherePath, '4px'),
	adoptedDecision('voice.tone', everywherePath, 'Warm and plain'),
	adoptedDecision('voice.wordsToAvoid', everywherePath, ['synergy', 'leverage']),
	adoptedDecision('audience.description', everywherePath, 'Landlords with a handful of flats'),
	adoptedDecision('look.colour.primary', 'web.site', '#112233')
];

function pageOf(decisions = kitDecisions) {
	const brand = resolveBrand(decisions, builtInTraits, everywhere);
	return brandKitPageOf({ brand, catalogue: builtInTraits, decisions });
}

const labelsOf = (entries: { label: string }[]) => entries.map((entry) => entry.label);

describe('the brand kit page', () => {
	it('puts each decided trait in its section, as the kit holds everywhere', () => {
		const page = pageOf();
		expect(page.palette.map((entry) => entry.value)).toEqual(['#0a2540']);
		expect(labelsOf(page.type)).toEqual(['Body typeface']);
		expect(labelsOf(page.spacingAndShape)).toEqual(['Corner radius']);
		expect(labelsOf(page.voice)).toEqual(['Tone']);
		expect(labelsOf(page.audience)).toEqual(['Who they are']);
	});

	it('shows the brand’s kinds of post in a section of their own, apart from the voice', () => {
		const page = pageOf([...kitDecisions, adoptedDecision('voice.postKinds', everywherePath, ['patient story', 'tip'])]);
		expect(page.postKinds).toEqual([expect.objectContaining({ label: 'Kinds of post', value: 'patient story, tip' })]);
		expect(labelsOf(page.voice)).toEqual(['Tone']);
		expect(pageOf().postKinds).toEqual([]);
	});

	it('keeps the words to avoid out of the voice and in the never-say list', () => {
		const page = pageOf();
		expect(page.neverSay).toEqual([expect.objectContaining({ label: 'Words to avoid', value: 'synergy, leverage' })]);
	});

	it('shows the decision that set each part: why, who and when', () => {
		const [colour] = pageOf().palette;
		expect(colour).toMatchObject({ reason: 'The colour of the shopfront', source: 'Set by Your Business Today', decidedOn: primary.decidedAt });
	});

	it('lists a decision made for one channel apart, with the channel named', () => {
		const [websiteColour] = pageOf().forOneChannel;
		expect(websiteColour).toMatchObject({ channel: 'Website', label: 'Primary colour', value: '#112233' });
	});

	it('leaves out a retired decision and shows empty sections for an empty kit', () => {
		const retired: Decision = { ...primary, status: 'retired' };
		const page = pageOf([retired]);
		expect(page.palette).toEqual([]);
		expect(page.forOneChannel).toEqual([]);
	});
});
