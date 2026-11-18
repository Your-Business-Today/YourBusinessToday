import { describe, expect, it } from 'vitest';
import { promotionBody } from './promotionPullRequest';
import { deployByHandStart, timedWindowStart } from '$lib/data/deployStart';
import type { Project } from '$lib/server/projects/projectRecord';

const portal = { defaultBranch: 'main', deployStagingAt: '00:00' } as Project;
const emailAddressPattern = /\S+@\S+/;

describe('what the promotion pull request says started it', () => {
	it('names nobody when Deploy now was pressed, since the pull request is public on GitHub', () => {
		const body = promotionBody(portal, { commitCount: 2, start: deployByHandStart, summary: '' });
		expect(body).toContain('when Deploy now was pressed');
		expect(body).not.toMatch(emailAddressPattern);
	});

	it('names the window when the deploy window opened it', () => {
		const body = promotionBody(portal, { commitCount: 1, start: timedWindowStart, summary: '' });
		expect(body).toContain("at the project's deploy window (00:00 UK time)");
	});
});
