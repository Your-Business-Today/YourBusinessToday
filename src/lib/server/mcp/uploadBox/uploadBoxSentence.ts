import { describeByteCount, maxAttachmentByteCount } from '$lib/data/taskAttachmentRules';
import { uploadPageLifetimeMinutes } from '$lib/server/projects/taskUploadLink';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** What Claude is told once the box is shown: what to ask of the person, and the page to hand them beside it. */
export function uploadBoxSentence(task: ProjectTask, uploadPage: string): string {
	return [
		`An upload box for "${task.title}" is now in the conversation wherever the host draws one — ` +
			'Claude on the web, on desktop and on mobile do. Ask the person to drop, paste or choose ' +
			'their files in it: each lands on the task as an attachment under their name, at full ' +
			`quality, up to ${describeByteCount(maxAttachmentByteCount)}.`,
		'Give them this link as well, for when no box appears (Claude Code draws none) or it will ' +
			'not take a file. It opens a page that does the same in their browser, with no sign-in, ' +
			`and works for the next ${uploadPageLifetimeMinutes} minutes:`,
		uploadPage,
		'When they say the files are in, call read_task to see what arrived, then say on the task ' +
			'what each one shows.'
	].join('\n');
}
