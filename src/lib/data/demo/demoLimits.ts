/** What one prospect's copy will hold, stated once for the connector and the page. */
export const DemoLimit = {
	noteLength: 500,
	notesKept: 50,
	logEntriesKept: 100,
	tokenPattern: /^[0-9a-f]{24}$/
} as const;
