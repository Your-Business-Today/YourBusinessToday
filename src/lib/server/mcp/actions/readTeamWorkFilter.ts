import { doneTaskStatus, taskStatusOrder } from '$lib/data/taskStatus';
import { everyJob, nobodyAssigned, type TeamWorkFilter } from '$lib/data/teamWorkFilter';
import { isUuid } from '$lib/data/isUuid';
import { readOptionalText, textField } from '../actionTypes';

const assignedToMe = 'me';
const openStatuses = taskStatusOrder.filter((status) => status !== doneTaskStatus);

/** The filters read_team_work takes, the same as the Tasks page's filter bar. */
export const teamWorkFilterFields = {
	assignedTo: textField(`Only the jobs assigned to "${assignedToMe}", to "${nobodyAssigned}", or to a person's account id`),
	productId: textField("Only the jobs on one of the organisation's products, by its project id"),
	status: textField(`Only the jobs at one status: ${openStatuses.join(', ')}`)
};

const assignedToRefusal = `assignedTo is "${assignedToMe}", "${nobodyAssigned}" or an account id, as list_project_people gives it.`;
const productIdRefusal = 'productId is a project id, as list_projects gives it.';
const statusRefusal = `status is one of ${openStatuses.join(', ')}: the list holds only open jobs.`;

/** The filter the input asks for, or why it cannot be read. */
export function readTeamWorkFilter(input: Record<string, unknown>, callerId: string): TeamWorkFilter | string {
	const assignedTo = readOptionalText(input, 'assignedTo');
	const productId = readOptionalText(input, 'productId');
	const status = readOptionalText(input, 'status');
	if (assignedTo !== null && !isPersonAsked(assignedTo)) return assignedToRefusal;
	if (productId !== null && !isUuid(productId)) return productIdRefusal;
	if (status !== null && !openStatuses.some((openStatus) => openStatus === status)) return statusRefusal;
	const person = assignedTo === assignedToMe ? callerId : assignedTo;
	return { ...everyJob, assignedTo: person, productId, status };
}

function isPersonAsked(assignedTo: string): boolean {
	return assignedTo === assignedToMe || assignedTo === nobodyAssigned || isUuid(assignedTo);
}
