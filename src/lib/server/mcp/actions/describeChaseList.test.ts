import { describe, expect, it } from 'vitest';
import { describeChaseList, nobodyToChase, nothingYouAskedFor } from './describeChaseList';
import type { ChaseItem, ChaseList } from './chaseList';

const jeremy = { id: 'jeremy', name: 'Jeremy', email: 'jeremy@example.com' };
const nigel = { id: 'nigel', name: 'Nigel Reilly', email: 'nigel@example.com' };
const scarlett = { id: 'scarlett', name: 'Scarlett', email: 'scarlett@example.com' };

const insuranceTask = { kind: 'task' as const, id: 'insurance', title: 'Buy cyber insurance', projectName: 'YourBusinessToday' };
const termsTask = { kind: 'task' as const, id: 'terms', title: 'Add terms to the register', projectName: 'Jewel PFP Portal' };
const exportGoal = { kind: 'goal' as const, id: 'export', title: 'Clients hold their own data', projectName: 'Portal Template' };

const insuranceAnswer: ChaseItem = {
	personId: nigel.id,
	subject: insuranceTask,
	reason: 'answer',
	askKind: 'information',
	askedById: jeremy.id,
	question: 'Nigel, which insurer do we go with?',
	since: '2026-10-20T09:00:00Z'
};

const exportTest: ChaseItem = { ...insuranceAnswer, subject: exportGoal, askKind: 'testing', askedById: scarlett.id, question: 'Download a real export?' };

const termsWork: ChaseItem = {
	personId: scarlett.id,
	subject: termsTask,
	reason: 'work',
	askKind: null,
	askedById: nigel.id,
	question: null,
	since: null
};

const termsPromise: ChaseItem = { ...termsWork, reason: 'promise', question: 'Send the terms to legal', since: '2026-11-01T09:00:00Z' };

const everything: ChaseList = {
	items: [termsWork, insuranceAnswer, exportTest, termsPromise],
	people: [jeremy, nigel, scarlett],
	isOnlyAskedByViewer: false
};

describe('who to chase', () => {
	const described = describeChaseList(everything, jeremy.id).join('\n');

	it('opens with how much is waiting on how many people', () => {
		expect(described).toContain('4 items waiting on 2 people.');
	});

	it('lists each kind of thing owed apart, tests included, whoever asked', () => {
		expect(described).toContain('Answers to give (1):');
		expect(described).toContain('"Buy cyber insurance" on YourBusinessToday (task id: insurance). You asked on 20 Oct 2026: Nigel, which insurer do we go with?');
		expect(described).toContain('Features to test (1):');
		expect(described).toContain('(goal id: export). Scarlett asked on 20 Oct 2026');
	});

	it('lists the tasks in their name, whoever raised them, and the to-dos they promised', () => {
		expect(described).toContain('Tasks in their name (1):');
		expect(described).toContain('- "Add terms to the register" on Jewel PFP Portal (task id: terms)');
		expect(described).toContain('To-dos they promised (1):');
		expect(described).toContain('- Send the terms to legal, promised on 1 Nov 2026 for "Add terms to the register"');
	});

	it('says so when nobody owes anything', () => {
		expect(describeChaseList({ items: [], people: [], isOnlyAskedByViewer: false }, jeremy.id)).toContain(nobodyToChase);
	});

	it('says when it is narrowed to what the viewer asked for', () => {
		const narrowed = describeChaseList({ items: [], people: [], isOnlyAskedByViewer: true }, jeremy.id);
		expect(narrowed).toContain(nothingYouAskedFor);
	});
});
