import {
	describeUpload,
	uploadOutcomeStatuses,
	uploadPageActions,
	uploadThroughSignedLink
} from '$lib/components/projects/uploadThroughSignedLink';
import { validateAttachmentUpload } from '$lib/data/validateAttachmentUpload';
import type { AttachmentUploadOutcome } from '$lib/components/projects/uploadThroughSignedLink';

export type SentFileStatus = 'sending' | 'onTheTask' | 'failed';

export const sentFileStatuses = {
	sending: 'sending',
	onTheTask: 'onTheTask',
	failed: 'failed'
} as const;

export type SentFile = { name: string; status: SentFileStatus; problem: string | null };

const couldNotBeSent: AttachmentUploadOutcome = {
	status: uploadOutcomeStatuses.failed,
	message: 'That file could not be sent — check your connection and try it again.'
};

/** The files a person has given the upload page, one after another, each with what became of it. */
export class UploadPageFiles {
	sentFiles = $state<SentFile[]>([]);
	private filesBeingSent: Promise<void> = Promise.resolve();

	send(files: File[]): void {
		for (const file of files) {
			this.sentFiles.push({ name: file.name, status: sentFileStatuses.sending, problem: null });
			const sentFile = this.sentFiles[this.sentFiles.length - 1];
			this.filesBeingSent = this.filesBeingSent.then(() => this.sendOne(file, sentFile));
		}
	}

	private async sendOne(file: File, sentFile: SentFile): Promise<void> {
		const outcome = await this.outcomeOfSending(file);
		if (outcome.status === uploadOutcomeStatuses.uploaded) {
			sentFile.status = sentFileStatuses.onTheTask;
			return;
		}
		sentFile.status = sentFileStatuses.failed;
		sentFile.problem = outcome.message;
	}

	private async outcomeOfSending(file: File): Promise<AttachmentUploadOutcome> {
		const problem = validateAttachmentUpload(describeUpload(file));
		if (problem !== null) return { status: uploadOutcomeStatuses.failed, message: problem };
		return uploadThroughSignedLink(file, uploadPageActions).catch(() => couldNotBeSent);
	}
}
