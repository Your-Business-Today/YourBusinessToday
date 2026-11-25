import { describe, expect, it } from 'vitest';
import { planMemberSync } from './memberSync';

const member = (id: string, projectId: string, joinedMonth: string, leftMonth: string | null = null) => ({ id, projectId, joinedMonth, leftMonth });

describe('planMemberSync', () => {
	it('ends the spell of a project no longer using the cost the month before, and starts a new one in the month', () => {
		const members = [member('m-ybt', 'ybt', '2026-01'), member('m-prentice', 'prentice', '2026-03')];
		const plan = planMemberSync(members, '2026-12', ['ybt', 'carp-mania']);
		expect(plan.joining).toEqual(['carp-mania']);
		expect(plan.leaving).toEqual([{ memberId: 'm-prentice', projectId: 'prentice', leftMonth: '2026-11' }]);
		expect(plan.staying).toEqual(['ybt']);
		expect(plan.removed).toEqual([]);
	});

	it('takes off a project added for that very month, and leaves alone one set to join later', () => {
		const members = [member('m-new', 'annapurna', '2026-12'), member('m-later', 'cod-mania', '2027-03')];
		const plan = planMemberSync(members, '2026-12', ['cod-mania']);
		expect(plan.removed).toEqual([{ memberId: 'm-new', projectId: 'annapurna' }]);
		expect(plan.joiningLater).toEqual(['cod-mania']);
		expect(plan.joining).toEqual([]);
	});

	it('leaves a project that already left as it was, and lets it join again', () => {
		const plan = planMemberSync([member('m-old', 'jewel-ps', '2026-01', '2026-06')], '2026-12', ['jewel-ps']);
		expect(plan.joining).toEqual(['jewel-ps']);
		expect(plan.leaving).toEqual([]);
	});
});
