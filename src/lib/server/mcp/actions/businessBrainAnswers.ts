import { businessBrainPartNames, type BusinessBrainPageGiven } from '$lib/data/businessBrainRules';
import type { BusinessBrainPageFound } from '$lib/server/businessBrain/fileBusinessBrainPage';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const noSuchSource =
	"This organisation's brain has no source by that sourceId. Give the sourceId an earlier filing gave back, or name a new source with sourceTitle.";

export const noSuchPage =
	"This organisation's brain has no page by that pageId. Give the pageId filing the page gave back.";

export const nothingNewToFile =
	'The page already reads exactly so, so nothing was filed and its history is unchanged.';

export const revisedMeanwhile =
	'Someone revised this page while you were filing, so it was left as they made it. Read it again and file your revision on top of theirs.';

function brainOf(organisation: Organisation): string {
	return `${organisation.name}'s Your Business Brain`;
}

export function pageFiled(organisation: Organisation, page: BusinessBrainPageGiven, filed: { pageId: string; sourceId: string }): string {
	const partName = businessBrainPartNames[page.part];
	return [
		`Filed "${page.title}" in ${brainOf(organisation)}, under ${partName}.`,
		`Page id: ${filed.pageId}. Source id: ${filed.sourceId}; give it as sourceId for every other page you file from the same source.`
	].join('\n');
}

export function subjectAlreadyFiled(organisation: Organisation, page: BusinessBrainPageGiven, found: BusinessBrainPageFound): string {
	const partName = businessBrainPartNames[page.part];
	return [
		`${brainOf(organisation)} already has a page on this subject under ${partName}: "${found.title}" (page id ${found.pageId}). Nothing was filed.`,
		'One subject is one page: file what is new about it with file_business_brain_page_revision, or give a slug of its own if this is a different subject.'
	].join('\n');
}

export function revisionFiled(organisation: Organisation, title: string, filed: { pageId: string; sourceId: string }): string {
	return [
		`Revised "${title}" in ${brainOf(organisation)}; the earlier version is kept in the page's history.`,
		`Page id: ${filed.pageId}. Source id: ${filed.sourceId}.`
	].join('\n');
}
