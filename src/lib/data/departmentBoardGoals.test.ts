import { describe, expect, it } from 'vitest';
import { goalsForBoardTabs } from './departmentBoard';
import { boardTabs } from './boardTab';
import { departments } from './department';

describe('the goals a tab shows', () => {
	const signClient = { id: 'sign', department: departments.administration };
	const process = { id: 'process', department: departments.development };
	const marketing = { id: 'listings', department: departments.marketing };

	it('keeps its own department’s goals and the ones its tasks serve from other departments', () => {
		const shown = goalsForBoardTabs(
			[signClient, process, marketing],
			[{ goalId: 'sign' }],
			[boardTabs.features]
		);
		expect(shown).toEqual([signClient, process]);
	});

	it('shows on Bugs only the goals its bugs serve', () => {
		expect(goalsForBoardTabs([signClient, process], [], [boardTabs.bugs])).toEqual([]);
		expect(goalsForBoardTabs([signClient, process], [{ goalId: 'process' }], [boardTabs.bugs])).toEqual([
			process
		]);
	});

	it('shows on Internal work the goals of every internal department', () => {
		const internalTabs = [boardTabs.administration, boardTabs.sales, boardTabs.marketing];
		expect(goalsForBoardTabs([signClient, process, marketing], [], internalTabs)).toEqual([signClient, marketing]);
	});
});
