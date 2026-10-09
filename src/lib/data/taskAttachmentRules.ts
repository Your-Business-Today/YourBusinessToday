export type AttachmentPreviewKind = 'image' | 'pdf';

export const attachmentPreviewKinds = { image: 'image', pdf: 'pdf' } as const;
export type AttachmentContentKind =
	'text' | 'wordDocument' | 'pdf' | 'spreadsheet' | 'image' | 'file' | 'link';

const megabyte = 1024 * 1024;
const kilobyte = 1024;

export const maxAttachmentByteCount = 25 * megabyte;
export const maxAttachmentFilenameLength = 255;

const mimeTypeShape = /^[^/\s]{1,127}\/[^/\s]{1,127}$/;

/** Vercel caps a function request or response at 4.5 MB, and base64 grows a file by a third. */
export const maxInlineAttachmentByteCount = 3 * megabyte;

const pdfMimeType = 'application/pdf';
const wordDocumentMimeType =
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const spreadsheetMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const textLikeMimeTypes = ['application/json', 'application/xml'];
const inlineImageMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

export function isWithinAttachmentLimit(byteCount: number): boolean {
	return byteCount > 0 && byteCount <= maxAttachmentByteCount;
}

export function isMimeTypeShaped(mimeType: string): boolean {
	return mimeTypeShape.test(mimeType);
}

export function attachmentLimitDescription(): string {
	return 'Any file up to 25MB.';
}

export function describeByteCount(byteCount: number): string {
	if (byteCount >= megabyte) return `${megabytesOf(byteCount)} MB`;
	if (byteCount >= kilobyte) return `${Math.round(byteCount / kilobyte)} KB`;
	return `${byteCount} B`;
}

function megabytesOf(byteCount: number): string {
	return (byteCount / megabyte).toFixed(1);
}

export function previewKindFor(mimeType: string): AttachmentPreviewKind | null {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType === pdfMimeType) return 'pdf';
	return null;
}

/** How an attachment's content travels to an assistant: as text drawn out of it, or as the file itself. */
export function contentKindFor(mimeType: string, byteCount: number): AttachmentContentKind {
	const extractedKind = extractedContentKindFor(mimeType);
	if (extractedKind !== null) return extractedKind;
	if (byteCount > maxInlineAttachmentByteCount) return 'link';
	if (inlineImageMimeTypes.includes(mimeType)) return 'image';
	return 'file';
}

function extractedContentKindFor(mimeType: string): AttachmentContentKind | null {
	if (mimeType === wordDocumentMimeType) return 'wordDocument';
	if (mimeType === pdfMimeType) return 'pdf';
	if (mimeType === spreadsheetMimeType) return 'spreadsheet';
	if (mimeType.startsWith('text/') || textLikeMimeTypes.includes(mimeType)) return 'text';
	return null;
}

export function fileExtensionLabel(filename: string): string {
	const extension = filename.split('.').pop() ?? '';
	if (extension === '' || extension === filename) return 'file';
	return extension.slice(0, 4);
}
