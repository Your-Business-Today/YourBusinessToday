import { maxAttachmentByteCount } from '$lib/data/taskAttachmentRules';
import { readResponseWithin } from '$lib/server/web/readResponseWithin';
import type { AttachmentFile } from './storeTaskAttachment';

export type SourceFetch =
	| { status: 'fetched'; file: AttachmentFile }
	| { status: 'not_a_web_address' }
	| { status: 'unreachable'; reason: string }
	| { status: 'too_large' };

export const sourceFetchStatuses = {
	fetched: 'fetched',
	notAWebAddress: 'not_a_web_address',
	unreachable: 'unreachable',
	tooLarge: 'too_large'
} as const;

const webProtocols = ['http:', 'https:'];
const unknownMimeType = 'application/octet-stream';
const fallbackFilename = 'attachment';

export async function fetchAttachmentSource(
	sourceUrl: string,
	filename: string | null
): Promise<SourceFetch> {
	const url = parseWebAddress(sourceUrl);
	if (url === null) return { status: 'not_a_web_address' };
	const response = await fetch(url).catch((failure: Error) => failure);
	if (response instanceof Error) return { status: 'unreachable', reason: response.message };
	if (!response.ok) return { status: 'unreachable', reason: `it answered ${response.status}` };
	if (declaredByteCount(response) > maxAttachmentByteCount) return { status: 'too_large' };
	const bytes = await readResponseWithin(response, maxAttachmentByteCount);
	if (bytes === null) return { status: 'too_large' };
	return {
		status: 'fetched',
		file: {
			filename: filename ?? filenameFrom(url),
			mimeType: mimeTypeFrom(response),
			byteCount: bytes.byteLength,
			bytes
		}
	};
}

function parseWebAddress(sourceUrl: string): URL | null {
	if (!URL.canParse(sourceUrl)) return null;
	const url = new URL(sourceUrl);
	if (!webProtocols.includes(url.protocol)) return null;
	return url;
}

function declaredByteCount(response: Response): number {
	return Number(response.headers.get('content-length') ?? 0);
}

function mimeTypeFrom(response: Response): string {
	const contentType = response.headers.get('content-type') ?? '';
	const mimeType = contentType.split(';')[0].trim();
	if (mimeType === '') return unknownMimeType;
	return mimeType;
}

function filenameFrom(url: URL): string {
	const lastSegment = decodeURIComponent(url.pathname.split('/').pop() ?? '');
	if (lastSegment === '') return fallbackFilename;
	return lastSegment;
}
