import { describe, expect, it } from 'vitest';
import { deployWindowOutcomes, type DeployWindow } from './deployWindow';
import { describeDeployWindow, deployWindowFacts } from './deployWindowFacts';

const project = { deployStagingAt: '18:00', defaultBranch: 'main' };
const clock = { date: '2026-10-25', time: '19:00' };
const opened: DeployWindow = {
	projectId: 'p1',
	windowDate: '2026-10-25',
	ranAt: '2026-10-25T17:02:00Z',
	outcome: deployWindowOutcomes.opened,
	pullRequestUrl: 'https://github.com/example/ybt/pull/7',
	note: 'Merges itself once its checks pass.'
};

describe('deployWindowFacts', () => {
	it('says nothing for a project with no deploy time', () => {
		expect(deployWindowFacts({ ...project, deployStagingAt: null }, opened, clock)).toEqual([]);
	});

	it('names today’s window until it has run, then tomorrow’s', () => {
		expect(deployWindowFacts(project, null, clock)).toEqual([{ label: 'staging deploys today at 18:00' }]);
		expect(deployWindowFacts(project, opened, clock)[0]).toEqual({ label: 'staging deploys tomorrow at 18:00' });
		const failed = { ...opened, outcome: deployWindowOutcomes.failed, pullRequestUrl: '', note: 'GitHub answered 403' };
		expect(deployWindowFacts(project, failed, clock)[0]).toEqual({ label: 'staging deploys today at 18:00' });
	});

	it('links the last promotion, and says when there was nothing to promote or the window failed', () => {
		expect(deployWindowFacts(project, opened, clock)[1]).toMatchObject({ href: opened.pullRequestUrl });
		expect(deployWindowFacts(project, opened, clock)[1].label).toMatch(/^staging sent to main /);
		const nothing = { ...opened, outcome: deployWindowOutcomes.nothingToPromote, pullRequestUrl: '' };
		expect(deployWindowFacts(project, nothing, clock)[1].label).toMatch(/^nothing to promote /);
		const failed = { ...opened, outcome: deployWindowOutcomes.failed, pullRequestUrl: '', note: 'GitHub answered 403' };
		expect(deployWindowFacts(project, failed, clock)[1].label).toMatch(/GitHub answered 403$/);
	});
});

describe('describeDeployWindow', () => {
	it('reads the facts as one sentence with the pull request’s address', () => {
		const sentence = describeDeployWindow(project, opened, clock);
		expect(sentence).toMatch(/^Deploy window: staging deploys tomorrow at 18:00; staging sent to main .* \(https:\/\/github.com\/example\/ybt\/pull\/7\)\.$/);
		expect(describeDeployWindow({ ...project, deployStagingAt: null }, null, clock)).toBe('');
	});
});
