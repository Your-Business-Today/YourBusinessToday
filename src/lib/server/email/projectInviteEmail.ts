import { arrivalButtonLabel, arrivalInstruction, renderInviteEmail } from './inviteEmailShell';

export function projectInviteEmailSubject(projectName: string): string {
	return `You have been added to ${projectName} on Your Business Today`;
}

export function renderProjectInviteEmail(
	inviterName: string,
	projectName: string,
	openProjectUrl: string,
	isNewAccount: boolean
): string {
	const body =
		'You can now see its goals and tasks, work on them, and talk to the team on each one — ' +
		`on the site or through your own assistant. ${arrivalInstruction(isNewAccount, 'the project')}`;
	return renderInviteEmail(
		`${inviterName} has added you to ${projectName}`,
		body,
		openProjectUrl,
		arrivalButtonLabel(isNewAccount, 'Open the project')
	);
}
