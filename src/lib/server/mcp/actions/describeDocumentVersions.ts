import { describeByteCount } from '$lib/data/taskAttachmentRules';
import type { ShownInputRequest } from '$lib/projectDocuments/documentInputRequest';
import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';

/** What a version holds, in place of the version the document holds now. */
export type ReadVersion = { versionNumber: number; filename: string; mimeType: string; byteCount: number };

/** A written version in full, with its text. */
export function describeWrittenVersion(heading: string, markdown: string): string {
	return [heading, '', markdown].join('\n');
}

/** A version kept as a file, with a short-lived link to fetch it. */
export function describeFileVersion(heading: string, version: ReadVersion, fetchLink: string, linkMinutes: number): string {
	return [
		heading,
		`File: ${version.filename}, ${version.mimeType}, ${describeByteCount(version.byteCount)}.`,
		`Fetch it within ${linkMinutes} minutes, to read it now; do not pass the link on: ${fetchLink}`
	].join('\n');
}

/** Which version this is, when it is an earlier one. */
export function describeEarlierVersion(versionNumber: number, currentNumber: number): string {
	if (versionNumber === currentNumber) return '';
	return `You are reading version ${versionNumber}; the document now holds version ${currentNumber}.`;
}

/** Every kept version, the newest first, for the Claude reading the document. */
export function describeVersionList(versions: DocumentVersion[]): string {
	if (versions.length <= 1) return 'No earlier versions.';
	const lines = versions.map((version) => `- version ${version.versionNumber}, kept ${version.recordedAt}, ${version.isWritten ? 'written' : version.filename}, ${describeByteCount(version.byteCount)}`);
	return ['## Versions, the newest first (read one with versionNumber)', ...lines].join('\n');
}

/** The input asked on the document, and what was given. */
export function describeInputRequests(requests: ShownInputRequest[]): string {
	if (requests.length === 0) return 'No input has been asked on it.';
	const lines = requests.map((request) => `- ${describeInputRequest(request)}`);
	return ['## Input asked', ...lines].join('\n');
}

function describeInputRequest(request: ShownInputRequest): string {
	const asked = `${request.askedByName} asked ${request.askedOfName} on ${request.createdAt}: "${request.question}"`;
	if (request.answer === null) return `${asked} — waiting on them (request id ${request.id})`;
	return `${asked} — answered on ${request.answeredAt}: "${request.answer}"`;
}
