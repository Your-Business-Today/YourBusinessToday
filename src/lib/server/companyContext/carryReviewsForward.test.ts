import { describe, expect, it } from 'vitest';
import { carryReviewsForward } from './carryReviewsForward';
import { joineryContextInput } from './companyContextFixtures';
import { validateCompanyContext } from './validateCompanyContext';
import type { CompanyContextDraft } from '$lib/data/companyContext/companyContext';

type Parts = Record<string, unknown>[];

function draftOf(input: Record<string, unknown>): CompanyContextDraft {
	const draft = validateCompanyContext(input);
	if ('refusal' in draft) throw new Error(draft.refusal);
	return draft;
}

function unreviewedRun(change: (parts: Parts) => void = () => {}): CompanyContextDraft {
	const input = joineryContextInput();
	const parts = (input.parts as Parts).map(({ reviewState, whatIsWrong, ...part }) => part);
	change(parts);
	return draftOf({ ...input, parts });
}

const earlier = { ...draftOf(joineryContextInput()), versionNumber: 2, recordedAt: '2026-11-10T17:00:00Z' };

function reviewOf(draft: CompanyContextDraft, key: string) {
	const part = draft.parts.find((candidate) => candidate.key === key);
	return [part?.reviewState, part?.whatIsWrong];
}

describe("a new version keeps the client's review of every part it leaves unchanged", () => {
	it('keeps right and not right, with the words, on parts that say what they said', () => {
		const { draft, keptReviewCount } = carryReviewsForward(unreviewedRun(), earlier);
		expect(reviewOf(draft, 'quote')).toEqual(['right', null]);
		expect(reviewOf(draft, 'quoting')).toEqual(['not_right', 'The site visit comes before the drawing, not after.']);
		expect(keptReviewCount).toBe(2);
	});

	it('starts a part put differently as not checked, so the client checks it again', () => {
		const revised = unreviewedRun((parts) => {
			parts[4] = { ...parts[4], steps: [{ does: 'Visit the site' }, { does: 'Draw the job', roleKey: 'estimator' }] };
		});
		const { draft } = carryReviewsForward(revised, earlier);
		expect(reviewOf(draft, 'quoting')).toEqual(['not_checked', null]);
	});

	it("keeps a review the client's Claude gives itself, and keeps nothing on a first version", () => {
		const told = unreviewedRun((parts) => {
			parts[1] = { ...parts[1], reviewState: 'right' };
		});
		expect(reviewOf(carryReviewsForward(told, earlier).draft, 'quote-spreadsheet')).toEqual(['right', null]);
		expect(carryReviewsForward(unreviewedRun(), null).keptReviewCount).toBe(0);
	});
});
