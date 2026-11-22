const textEncoder = new TextEncoder();

/** How many bytes a written document's text takes, as it downloads. */
export function writtenDocumentByteCount(markdown: string): number {
	return textEncoder.encode(markdown).length;
}
