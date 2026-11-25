import { describe, expect, it } from 'vitest';
import { countOpenWork, type CountedTask } from './openWorkCount';

const task = (projectName: string, department: CountedTask['department'], status: CountedTask['status']) => ({
	projectName,
	department,
	status
});

describe('counting what a person has open', () => {
	it('counts every task, ask and to-do, with nothing dropped', () => {
		const assigned = [task('YBT', 'development', 'backlog'), task('YBT', 'administration', 'in_progress'), task('PFP', 'development', 'backlog')];
		const named = [task('PFP', 'sales', 'on_hold')];
		const counted = countOpenWork({ assigned, named, askKinds: ['information', null, 'setup'], todoCount: 4 });
		expect(counted.assignedCount).toBe(3);
		expect(counted.namedCount).toBe(1);
		expect(counted.answerCount).toBe(2);
		expect(counted.setupCount).toBe(1);
		expect(counted.total).toBe(11);
		expect(counted.byProject.get('YBT')).toBe(2);
		expect(counted.byProject.get('PFP')).toBe(2);
		expect(counted.byDepartment.get('development')).toBe(2);
		expect(counted.byStatus.get('backlog')).toBe(2);
	});

	it('says zero only when there is nothing at all', () => {
		const counted = countOpenWork({ assigned: [], named: [], askKinds: [], todoCount: 0 });
		expect(counted.total).toBe(0);
	});
});
