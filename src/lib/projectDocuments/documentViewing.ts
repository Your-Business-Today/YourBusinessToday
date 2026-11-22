/** A document on the Documents page stays readable for three hours after the page is opened. */
export const documentViewLinkLifetimeSeconds = 3 * 60 * 60;

const pdfType = 'application/pdf';
const pictureTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

/** How a file shows on its page: a PDF in a reader, a picture as itself, anything else only by download. */
export type FileViewing = 'pdf' | 'picture' | 'download';

export const fileViewings = { pdf: 'pdf', picture: 'picture', download: 'download' } as const;

export function fileViewingOf(mimeType: string): FileViewing {
	if (mimeType === pdfType) return fileViewings.pdf;
	if (pictureTypes.has(mimeType)) return fileViewings.picture;
	return fileViewings.download;
}
