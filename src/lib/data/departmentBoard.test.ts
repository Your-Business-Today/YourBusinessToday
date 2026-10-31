import { describe, expect, it } from 'vitest';
import { chosenDepartment, departmentTabs, goalsForDepartment, inDepartment } from './departmentBoard';
import { departments } from './department';
import { taskStatuses } from './taskStatus';

const insurance = { department: departments.administration, status: taskStatuses.backlog };
const website = { department: departments.development, status: taskStatuses.backlog };
const doneWebsite = { department: departments.development, status: taskStatuses.done };

describe('the department board', () => {
	it('shows development unless the address names another department', () => {
		expect(chosenDepartment(new URL('https://ybt.test/projects/1'))).toBe(departments.development);
		const salesPage = new URL('https://ybt.test/projects/1?department=sales');
		expect(chosenDepartment(salesPage)).toBe(departments.sales);
	});

	it('keeps only the department chosen', () => {
		expect(inDepartment([insurance, website], departments.administration)).toEqual([insurance]);
	});

	it('counts each department’s open tasks, development first', () => {
		const tabs = departmentTabs([insurance, website, doneWebsite]);
		const counts = tabs.map((tab) => [tab.department, tab.openTaskCount]);
		expect(counts).toEqual([
			[departments.development, 1],
			[departments.infrastructure, 0],
			[departments.administration, 1],
			[departments.sales, 0],
			[departments.marketing, 0]
		]);
	});
});

describe('the goals a department tab shows', () => {
	it('keeps its own goals and the ones its tasks serve from other departments', () => {
		const signClient = { id: 'sign', department: departments.administration };
		const process = { id: 'process', department: departments.development };
		const marketing = { id: 'listings', department: departments.marketing };
		const continuityBuild = { goalId: 'sign' };
		const shown = goalsForDepartment([signClient, process, marketing], [continuityBuild], departments.development);
		expect(shown).toEqual([signClient, process]);
	});
});
