import { formatUkDateTime } from '$lib/data/britishDate';
import type { BusinessBrainPageGlance } from '$lib/server/businessBrain/readBusinessBrainPageGlance';

const oneFile = 1;

/** When the page was last filed and what it was filed from, in one line. */
export function filedSentence(glance: BusinessBrainPageGlance): string {
	const filed = `Filed ${formatUkDateTime(glance.updatedAt)}`;
	return [filed, sourceWords(glance)].filter((words) => words !== null).join(' · ');
}

function sourceWords(glance: BusinessBrainPageGlance): string | null {
	const { sourceTitle, sourceFileCount } = glance;
	if (sourceFileCount === oneFile) return 'from 1 source file';
	if (sourceFileCount > oneFile) return `from ${sourceFileCount} source files`;
	if (sourceTitle !== null) return `from ${sourceTitle}`;
	return null;
}
