const acceptedProtocols = ['http:', 'https:'];

/** Whether the text is a full web address, starting http:// or https://, as a link column takes it. */
export function isWebAddress(candidate: string): boolean {
	try {
		return acceptedProtocols.includes(new URL(candidate).protocol);
	} catch {
		return false;
	}
}
