import { describe, expect, it } from 'vitest';
import { everyJob, jobsShownBy, nobodyAssigned } from './teamWorkFilter';
import { departments } from './department';
import { taskStatuses } from './taskStatus';
import type { TeamWorkItem } from './organisationTeamWork';

const james = 'james';
const jeremy = 'jeremy';

function jobOf(id: string, productId: string, status: TeamWorkItem['status'], assigneeIds: string[]): TeamWorkItem {
	const department = departments.administration;
	return { id, title: id, department, status, dueDate: null, productId, productName: productId, assigneeIds, href: `/${id}` };
}

const jobs = [
	jobOf('insurance', 'harbour', taskStatuses.backlog, [james]),
	jobOf('accounts', 'harbour', taskStatuses.inProgress, [james, jeremy]),
	jobOf('listing', 'meadow', taskStatuses.onHold, []),
	jobOf('stripe', 'meadow', taskStatuses.backlog, [jeremy])
];

const idsOf = (items: TeamWorkItem[]) => items.map(({ id }) => id);

describe('jobsShownBy', () => {
	it('lets every job through when nothing is asked', () => {
		expect(idsOf(jobsShownBy(jobs, everyJob))).toEqual(['insurance', 'accounts', 'listing', 'stripe']);
	});

	it('shows the jobs a person has, shared or alone, or the ones nobody has', () => {
		expect(idsOf(jobsShownBy(jobs, { ...everyJob, assignedTo: jeremy }))).toEqual(['accounts', 'stripe']);
		expect(idsOf(jobsShownBy(jobs, { ...everyJob, assignedTo: nobodyAssigned }))).toEqual(['listing']);
	});

	it('narrows by product and by status together', () => {
		expect(idsOf(jobsShownBy(jobs, { ...everyJob, productId: 'meadow' }))).toEqual(['listing', 'stripe']);
		expect(idsOf(jobsShownBy(jobs, { assignedTo: james, productId: 'harbour', status: taskStatuses.backlog }))).toEqual(['insurance']);
	});
});
