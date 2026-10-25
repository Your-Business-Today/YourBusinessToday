import { describe, expect, it } from 'vitest';
import { deployWindowOutcomes, deployWindowStarts, noDeployWindows, type DeployWindow } from './deployWindow';
import { describeDeployWindow, deployWindowFacts } from './deployWindowFacts';

const project = { deployStagingAt: '18:00', defaultBranch: 'main' };
const clock = { date: '2026-10-25', time: '19:00' };
const opened: DeployWindow = {
	projectId: 'p1',
	windowDate: '2026-10-25',
	ranAt: '2026-10-25T17:02:00Z',
	startedBy: deployWindowStarts.window,
	outcome: deployWindowOutcomes.opened,
	pullRequestUrl: 'https://github.com/example/ybt/pull/7',
	note: 'Merges itself once its checks pass.'
};
const failed = { ...opened, outcome: deployWindowOutcomes.failed, pullRequestUrl: '', note: 'GitHub answered 403' };
const byHand = { ...opened, startedBy: deployWindowStarts.manual, ranAt: '2026-10-25T14:30:00Z' };

describe('deployWindowFacts', () => {
	it('says nothing for a project with no deploy time and no deploy by hand', () => {
		expect(deployWindowFacts({ ...project, deployStagingAt: null }, noDeployWindows, clock)).toEqual([]);
	});

	it('names today’s window until it has run, then tomorrow’s', () => {
		expect(deployWindowFacts(project, noDeployWindows, clock)).toEqual([{ label: 'staging deploys today at 18:00' }]);
		const done = { latest: opened, lastTimed: opened };
		expect(deployWindowFacts(project, done, clock)[0]).toEqual({ label: 'staging deploys tomorrow at 18:00' });
		expect(deployWindowFacts(project, { latest: failed, lastTimed: failed }, clock)[0]).toEqual({ label: 'staging deploys today at 18:00' });
	});

	it('still names today’s window after a deploy by hand, which takes no window', () => {
		const facts = deployWindowFacts(project, { latest: byHand, lastTimed: null }, clock);
		expect(facts[0]).toEqual({ label: 'staging deploys today at 18:00' });
	});

	it('links the last promotion, and says when there was nothing to promote or the window failed', () => {
		const done = { latest: opened, lastTimed: opened };
		expect(deployWindowFacts(project, done, clock)[1]).toMatchObject({ href: opened.pullRequestUrl });
		expect(deployWindowFacts(project, done, clock)[1].label).toMatch(/^staging sent to main /);
		const nothing = { ...opened, outcome: deployWindowOutcomes.nothingToPromote, pullRequestUrl: '' };
		expect(deployWindowFacts(project, { latest: nothing, lastTimed: nothing }, clock)[1].label).toMatch(/^nothing to promote /);
		expect(deployWindowFacts(project, { latest: failed, lastTimed: failed }, clock)[1].label).toMatch(/GitHub answered 403$/);
	});

	it('says when the last promotion was by hand, even on a project with no deploy time', () => {
		const facts = deployWindowFacts({ ...project, deployStagingAt: null }, { latest: byHand, lastTimed: null }, clock);
		expect(facts).toHaveLength(1);
		expect(facts[0]).toMatchObject({ label: expect.stringMatching(/^staging sent to main by hand /), href: byHand.pullRequestUrl });
		const failedByHand = { ...byHand, outcome: deployWindowOutcomes.failed, note: 'GitHub answered 403' };
		expect(deployWindowFacts(project, { latest: failedByHand, lastTimed: null }, clock)[1].label).toMatch(/^✗ deploy by hand /);
	});
});

describe('describeDeployWindow', () => {
	it('reads the facts as one sentence with the pull request’s address', () => {
		const sentence = describeDeployWindow(project, { latest: opened, lastTimed: opened }, clock);
		expect(sentence).toMatch(/^Deploy window: staging deploys tomorrow at 18:00; staging sent to main .* \(https:\/\/github.com\/example\/ybt\/pull\/7\)\.$/);
		expect(describeDeployWindow({ ...project, deployStagingAt: null }, noDeployWindows, clock)).toBe('');
	});
});
