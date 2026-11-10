export const mostInvitesPerHour = 20;
export const tooManyInvitesMessage =
	'You have sent a lot of invitations this hour — try again a little later.';

const oneHourInMilliseconds = 60 * 60 * 1000;

export function inviteWindowStart(): string {
	return new Date(Date.now() - oneHourInMilliseconds).toISOString();
}

export function isInviteAllowanceSpent(invitesThisHour: number): boolean {
	return invitesThisHour >= mostInvitesPerHour;
}

/** Whether this many more invitations still fit in the hour's allowance. */
export function hasRoomForInvites(invitesThisHour: number, invitesToSend: number): boolean {
	return invitesThisHour + invitesToSend <= mostInvitesPerHour;
}
