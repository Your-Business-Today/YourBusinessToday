import { describe, expect, it } from 'vitest';
import { describeSummary, nothingOwed, type SummarySources } from './describeSummary';
import { unnamedAccountNotice } from './describeOwedTasks';
import { awaitingKinds, postedViaChannels } from '$lib/data/conversationTurn';
import { parseGlobalTaskRow } from '$lib/server/projects/getGlobalTaskPage';
import { taskStatuses } from '$lib/data/taskStatus';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

const jeremy = 'jeremy';
const scarlett = { id: 'scarlett', name: 'Scarlett', email: 'scarlett@example.com' };
const propertyServe = { id: 'jewel-ps-portal', name: 'Jewel Property Serve Portal' };
const passiveFire = { id: 'jewel-pfp-portal', name: 'Jewel PFP Portal' };

function taskOn(project: typeof propertyServe, id: string, title: string) {
	const projects = { name: project.name };
	const row = { id, title, status: 'backlog', kind: 'work', project_id: project.id, projects };
	return parseGlobalTaskRow(row);
}

const termsQuestion: WaitingQuestion = {
	id: 'message',
	goalId: null,
	taskId: 'terms',
	authorAccountId: scarlett.id,
	body: 'Jeremy, are terms v0.2 signed off?',
	isInternal: false,
	postedVia: postedViaChannels.claude,
	awaiting: { accountId: jeremy, kind: awaitingKinds.person },
	askKind: 'setup',
	pickedUpAt: null,
	createdAt: '2026-10-20T09:00:00Z',
	subjectKind: 'task',
	subjectId: 'terms',
	subjectTitle: 'Sign off the door survey terms',
	taskStatus: taskStatuses.inProgress,
	projectId: passiveFire.id,
	projectName: passiveFire.name
};

const jeremyOwes: SummarySources = {
	waiting: { questions: [termsQuestion], askers: [scarlett] },
	owed: {
		assigned: [taskOn(propertyServe, 'backlog', 'Move the enquiries backlog')],
		named: [taskOn(passiveFire, 'xero', 'Jeremy: ask Xero for the bank statement scope')],
		name: 'Jeremy',
		latestByTask: new Map(),
		accounts: []
	},
	viewerId: jeremy,
	projectOrder: [propertyServe.id, passiveFire.id]
};

describe('the YBT summary', () => {
	const described = describeSummary(jeremyOwes).join('\n');

	it('opens with the totals', () => {
		expect(described).toContain('In all: one decision waiting on you and 2 tasks for you to work.');
	});

	it('goes project by project in the order of the person’s projects', () => {
		const propertyServeAt = described.indexOf(`## ${propertyServe.name}`);
		const passiveFireAt = described.indexOf(`## ${passiveFire.name}`);
		expect(propertyServeAt).toBeGreaterThanOrEqual(0);
		expect(passiveFireAt).toBeGreaterThan(propertyServeAt);
	});

	it('puts the quick decisions above the work on the same project', () => {
		const passiveFireSection = described.slice(described.indexOf(`## ${passiveFire.name}`));
		const decisionsAt = passiveFireSection.indexOf('Quick decisions waiting on you (1):');
		const namedAt = passiveFireSection.indexOf('Work that names Jeremy, not assigned to you (1):');
		expect(decisionsAt).toBeGreaterThanOrEqual(0);
		expect(namedAt).toBeGreaterThan(decisionsAt);
		expect(passiveFireSection).toContain('[setup ask, waiting on the person you are with]');
	});

	it('lists the work assigned to the person with where it stands', () => {
		expect(described).toContain('Work assigned to you (1):');
		expect(described).toContain('- "Move the enquiries backlog", Backlog (task id: backlog). Nothing said on it yet.');
	});

	it('says so when nothing needs the person', () => {
		const owed = { ...jeremyOwes.owed, assigned: [], named: [] };
		const waiting = { questions: [], askers: [] };
		expect(describeSummary({ ...jeremyOwes, owed, waiting })).toEqual([nothingOwed]);
	});

	it('says when tasks titled with the person’s name were not looked for, even with nothing owed', () => {
		const owed = { ...jeremyOwes.owed, assigned: [], named: [], name: null };
		const waiting = { questions: [], askers: [] };
		expect(describeSummary({ ...jeremyOwes, owed, waiting })).toEqual([unnamedAccountNotice, '', nothingOwed]);
	});
});
