import type { SupabaseClient } from '@supabase/supabase-js';
import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
import { describeDocumentHeading } from './describeOwnedDocuments';
import { describeEarlierVersion, describeFileVersion, describeInputRequests, describeVersionList, describeWrittenVersion } from './describeDocumentVersions';
import { fetchLinkLifetimeMinutes, signFetchLink } from '$lib/server/storage/signFetchLink';
import { isWholeNumberWithin } from '$lib/data/fieldChecks';
import { projectDocumentBucket } from '$lib/server/projectDocuments/projectDocumentFiles';
import { readDocumentVersions, readVersionMarkdown } from '$lib/server/projectDocuments/findDocumentVersions';
import { readDocumentInput } from '$lib/server/projectDocuments/readDocumentInput';
import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

const { highestVersion } = DocumentLimits;

export const versionRefusal = `versionNumber is the version to read: a whole number from 1 up to ${highestVersion}`;

/** The document at the version asked, or the one it holds now, then every version it has had and the input asked on it. */
export async function readDocumentInFull(supabase: SupabaseClient, document: KeptDocument, versionAsked: unknown): Promise<string> {
	const isCurrentAsked = versionAsked === undefined;
	if (!isCurrentAsked && !isWholeNumberWithin(versionAsked, 1, highestVersion)) return `Not read: ${versionRefusal}.`;
	const wantedNumber = isCurrentAsked ? document.versionNumber : (versionAsked as number);
	const versions = await readDocumentVersions(supabase, document.id);
	const version = versions.find((candidate) => candidate.versionNumber === wantedNumber);
	if (version === undefined) return `${document.title} has no version ${wantedNumber}. ${describeVersionList(versions)}`;
	const heading = [describeDocumentHeading(document), describeEarlierVersion(wantedNumber, document.versionNumber)].filter(Boolean).join('\n');
	const content = await describeVersionContent(supabase, heading, version);
	return [content, '', describeVersionList(versions), '', describeInputRequests(await readDocumentInput(supabase, document.id))].join('\n');
}

async function describeVersionContent(supabase: SupabaseClient, heading: string, version: DocumentVersion): Promise<string> {
	const { storagePath, filename } = version;
	if (storagePath === null) {
		const markdown = await readVersionMarkdown(supabase, version);
		return describeWrittenVersion(heading, markdown);
	}
	const fetchLink = await signFetchLink(supabase, projectDocumentBucket, { storagePath, filename });
	return describeFileVersion(heading, version, fetchLink, fetchLinkLifetimeMinutes);
}
