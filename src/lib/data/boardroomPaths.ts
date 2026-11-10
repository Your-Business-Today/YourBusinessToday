/** Where an organisation's boardroom, its meetings and their papers open on the portal. */
export function boardroomPathOf(organisationId: string): string {
	return `/organisations/${organisationId}/boardroom`;
}

export function boardMeetingPathOf(organisationId: string, meetingId: string): string {
	return `${boardroomPathOf(organisationId)}/${meetingId}`;
}

export function boardPaperPathOf(organisationId: string, meetingId: string, paperId: string): string {
	return `${boardMeetingPathOf(organisationId, meetingId)}/papers/${paperId}`;
}
