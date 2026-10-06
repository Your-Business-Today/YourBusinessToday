import { attachmentLimitDescription, isWithinAttachmentLimit } from '$lib/data/taskAttachmentRules';
import { fetchAttachmentSource, sourceFetchStatuses } from '$lib/server/projects/fetchAttachmentSource';
import { readOptionalText } from '../actionTypes';
import type { AttachmentFile } from '$lib/server/projects/storeTaskAttachment';

const unknownMimeType = 'application/octet-stream';

export const tooLarge = `That file is over the limit. ${attachmentLimitDescription()}`;

export async function readAttachmentFileInput(
	input: Record<string, unknown>
): Promise<AttachmentFile | string> {
	const sourceUrl = readOptionalText(input, 'sourceUrl');
	const contentBase64 = readOptionalText(input, 'contentBase64');
	const filename = readOptionalText(input, 'filename');
	const mimeType = readOptionalText(input, 'mimeType');
	if (sourceUrl !== null && contentBase64 !== null) {
		return 'Give either sourceUrl or contentBase64, not both.';
	}
	if (sourceUrl !== null) return fileFromWeb(sourceUrl, filename, mimeType);
	if (contentBase64 !== null) return fileFromBase64(contentBase64, filename, mimeType);
	return 'Say where the file is: a sourceUrl to download, or contentBase64 for a small file.';
}

async function fileFromWeb(
	sourceUrl: string,
	filename: string | null,
	mimeType: string | null
): Promise<AttachmentFile | string> {
	const fetched = await fetchAttachmentSource(sourceUrl, filename);
	if (fetched.status === sourceFetchStatuses.notAWebAddress) return 'sourceUrl must be an http or https address.';
	if (fetched.status === sourceFetchStatuses.unreachable) {
		return `That address could not be downloaded — ${fetched.reason}.`;
	}
	if (fetched.status === sourceFetchStatuses.tooLarge) return tooLarge;
	return { ...fetched.file, mimeType: mimeType ?? fetched.file.mimeType };
}

function fileFromBase64(
	contentBase64: string,
	filename: string | null,
	mimeType: string | null
): AttachmentFile | string {
	if (filename === null) return 'A filename is needed alongside contentBase64.';
	const bytes = Buffer.from(contentBase64, 'base64');
	if (bytes.byteLength === 0) return 'contentBase64 decoded to nothing — check the encoding.';
	if (!isWithinAttachmentLimit(bytes.byteLength)) return tooLarge;
	return { filename, mimeType: mimeType ?? unknownMimeType, byteCount: bytes.byteLength, bytes };
}
