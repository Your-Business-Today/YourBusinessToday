import { describe, expect, it } from 'vitest';
import { developmentTabCountsOf } from './developmentTabCounts';
import type { DepartmentTab } from '$lib/data/departmentBoard';

describe('developmentTabCountsOf', () => {
	const departmentTabs: DepartmentTab[] = [
		{ tab: 'bugs', label: 'Bugs', openTaskCount: 2 },
		{ tab: 'features', label: 'Features', openTaskCount: 7 },
		{ tab: 'infrastructure', label: 'Infrastructure', openTaskCount: 0 },
		{ tab: 'administration', label: 'Administration', openTaskCount: 4 }
	];

	it('counts the open tasks on each Development backlog and the tasks staged for the next deploy', () => {
		expect(developmentTabCountsOf(departmentTabs, 3)).toEqual({
			bugs: 2,
			features: 7,
			infrastructure: 0,
			staged: 3
		});
	});
});
