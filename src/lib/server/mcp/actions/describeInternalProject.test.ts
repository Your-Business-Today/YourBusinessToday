import { describe, expect, it } from 'vitest';
import { describeInternalProject } from './describeInternalProject';
import { departments } from '$lib/data/department';
import type { InternalItemFacts } from './describeInternalItems';
import type { Project } from '$lib/server/projects/projectRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

const noFacts: InternalItemFacts = { people: [], assigneeIdsByTask: new Map(), todosByTask: {} };

const officeMove = {
	id: 'office-move',
	name: 'Office move',
	description: 'Move the team to the new office by March.',
	status: 'active',
	repositoryUrl: ''
} as unknown as Project;

const bookTheVan = {
	id: 'van',
	title: 'Book the removal van',
	department: departments.administration,
	kind: 'work',
	status: 'backlog',
	storyPoints: 0,
	priority: 1,
	goalId: null,
	dueDate: null,
	subtasks: []
} as unknown as TaskTreeNode;

describe('what read_project says of an internal project', () => {
	const said = describeInternalProject(officeMove, [], [bookTheVan], noFacts);

	it('names it internal and gives its Internal work', () => {
		expect(said).toMatch(/^Office move — .*, internal \(id: office-move\)/);
		expect(said).toContain('Task Management —');
		expect(said).toContain('Book the removal van');
	});

	it('says nothing of a Development side, a repository, deploys or the kit', () => {
		expect(said).not.toContain('Development —');
		expect(said).not.toMatch(/No repository recorded|refactor round|Kit /);
		expect(said).not.toContain('Database');
	});
});
