const managerLabel = 'Project manager';
const memberLabel = 'Member';

/** What someone is on an organisation: a project manager brings people on; a member reaches its projects. */
export function standingLabelOf(isManager: boolean): string {
	return isManager ? managerLabel : memberLabel;
}
