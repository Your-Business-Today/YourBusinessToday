/** Where an organisation's chat home is on the site. */
export function chatHomePath(organisationId: string): string {
	return `/organisations/${organisationId}/chat`;
}

/** Where one room of an organisation's chat is on the site. */
export function chatRoomPath(organisationId: string, roomId: string): string {
	return `${chatHomePath(organisationId)}/${roomId}`;
}

/** Where a file said in an organisation's chat opens: the site checks the reader, then sends them to a short-lived link. */
export function chatFilePath(organisationId: string, fileId: string): string {
	return `${chatHomePath(organisationId)}/files/${fileId}`;
}

/** Where one whiteboard of a room opens to be drawn on. */
export function chatWhiteboardPath(organisationId: string, roomId: string, whiteboardId: string): string {
	return `${chatRoomPath(organisationId, roomId)}/whiteboards/${whiteboardId}`;
}
