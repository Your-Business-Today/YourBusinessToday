import { describeByteCount, maxAttachmentByteCount } from '$lib/data/taskAttachmentRules';
import { uploadPageLifetimeMinutes } from '$lib/server/projects/taskUploadLink';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * What Claude is told once the box is asked for: where a box is drawn, where none is, and the page to
 * hand the person either way. The server cannot tell which kind of chat called it, so Claude decides.
 */
export function uploadBoxSentence(task: ProjectTask, uploadPage: string): string {
	return [
		`An upload box for "${task.title}" is drawn only in a chat the person started themselves ` +
			'in Claude on the web, on desktop or on mobile. There, ask them to drop, paste or choose ' +
			'their files in it: each lands on the task as an attachment under their name, at full ' +
			`quality, up to ${describeByteCount(maxAttachmentByteCount)}.`,
		'A scheduled chat — one a scheduled task started, in Cowork or anywhere else — and Claude ' +
			'Code draw no box. In one of those, do not mention a box: send the person straight to ' +
			'this link. Anywhere else, give it beside the box, for when it will not take a file. It ' +
			'opens a page that does the same in their browser, with no sign-in, and works for the ' +
			`next ${uploadPageLifetimeMinutes} minutes:`,
		uploadPage,
		'When they say the files are in, call read_task to see what arrived, then say on the task ' +
			'what each one shows.'
	].join('\n');
}
