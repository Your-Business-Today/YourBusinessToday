/** Where an organisation's chat home is on the site. */
export function chatHomePath(organisationId: string): string {
	return `/organisations/${organisationId}/chat`;
}

/** Where one room of an organisation's chat is on the site. */
export function chatRoomPath(organisationId: string, roomId: string): string {
	return `${chatHomePath(organisationId)}/${roomId}`;
}
