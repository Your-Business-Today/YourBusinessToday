import { describe, expect, it } from 'vitest';
import { checkContentDraft } from './checkContentDraft';

const tiktok = 'video.short.tiktok';

function problemOf(input: Record<string, unknown>): string {
	const check = checkContentDraft({ medium: tiktok, title: 'Fire doors, plainly', ...input });
	return 'problem' in check ? check.problem : '';
}

describe('checking a drafted piece against its columns', () => {
	it('keeps a piece that fits, words trimmed and the storyboard whole', () => {
		const storyboard = [{ description: ' A door closes ', seconds: 3, onScreenText: 'Click' }];
		const check = checkContentDraft({ medium: tiktok, title: ' Fire doors ', hook: 'Hear that?', storyboard });
		expect(check).toMatchObject({
			draft: {
				title: 'Fire doors',
				hook: 'Hear that?',
				storyboard: [{ description: 'A door closes', seconds: 3, onScreenText: 'Click' }]
			}
		});
	});

	it('refuses a medium the catalogue does not have', () => {
		expect(problemOf({ medium: 'video.fax' })).toContain('video.fax is not a medium');
	});

	it('refuses an empty title', () => {
		expect(problemOf({ title: '  ' })).toContain('title is empty');
	});

	it('refuses a caption longer than its column, rather than trimming it', () => {
		expect(problemOf({ caption: 'x'.repeat(2201) })).toBe('caption is 2201 characters; keep it to 2200');
	});

	it('refuses words given as something else', () => {
		expect(problemOf({ script: 42 })).toBe('script is words, not number');
	});

	it('refuses an action no audience does', () => {
		expect(problemOf({ invitedAction: 'teleport' })).toContain('invitedAction teleport is not something an audience does');
	});

	it('refuses a storyboard that is not a list, or a shot without a description', () => {
		expect(problemOf({ storyboard: 'one shot' })).toBe('storyboard is a list of shots');
		expect(problemOf({ storyboard: [{ seconds: 2 }] })).toBe('Shot 1 needs a description');
	});

	it('refuses a shot that holds longer than the longest shot', () => {
		expect(problemOf({ storyboard: [{ description: 'Wide', seconds: 601 }] })).toContain('seconds is a number from 0 to 600');
	});

	it('refuses more shots than a storyboard holds', () => {
		const storyboard = Array.from({ length: 41 }, () => ({ description: 'Shot' }));
		expect(problemOf({ storyboard })).toBe('storyboard has 41 shots; keep it to 40');
	});
});
