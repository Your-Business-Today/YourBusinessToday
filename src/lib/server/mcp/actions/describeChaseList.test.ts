import { describe, expect, it } from 'vitest';
import { describeChaseList, nobodyToChase } from './describeChaseList';
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
	askedById: jeremy.id,
	question: 'Nigel, which insurer do we go with?',
	since: '2026-10-20T09:00:00Z'
};

const exportAnswer: ChaseItem = { ...insuranceAnswer, subject: exportGoal, askedById: scarlett.id, question: 'Download a real export?' };

const termsWork: ChaseItem = {
	personId: scarlett.id,
	subject: termsTask,
	reason: 'work',
	askedById: null,
	question: null,
	since: null
};

const jeremyWaitsOn: ChaseList = { items: [termsWork, insuranceAnswer, exportAnswer], people: [jeremy, nigel, scarlett] };

describe('who to chase', () => {
	const described = describeChaseList(jeremyWaitsOn, jeremy.id).join('\n');

	it('opens with how much is waiting on how many people', () => {
		expect(described).toContain('3 items waiting on 2 people.');
	});

	it('puts the person with the most items first', () => {
		expect(described.indexOf('## Nigel Reilly (2)')).toBeLessThan(described.indexOf('## Scarlett (1)'));
	});

	it('says who asked each question, and what it asks', () => {
		expect(described).toContain('Waiting on an answer from them (2):');
		expect(described).toContain('"Buy cyber insurance" on YourBusinessToday (task id: insurance). You asked on 20 Oct 2026: Nigel, which insurer do we go with?');
		expect(described).toContain('(goal id: export). Scarlett asked on 20 Oct 2026');
	});

	it('lists the work the viewer asked for that someone else holds', () => {
		expect(described).toContain('Work you asked for that is with them (1):');
		expect(described).toContain('- "Add terms to the register" on Jewel PFP Portal (task id: terms)');
	});

	it('says so when nobody needs chasing', () => {
		expect(describeChaseList({ items: [], people: [] }, jeremy.id)).toContain(nobodyToChase);
	});
});
