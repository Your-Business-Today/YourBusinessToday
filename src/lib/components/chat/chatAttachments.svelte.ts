import { couldNotBeSent, sendChatFile } from './sendChatFile';
import { chatFileRefusal } from '$lib/data/chat/chatFileChecks';
import { chatFileLimits, chatFileRefusals } from '$lib/data/chat/chatFileRules';
import type { ChatFileSent } from '$lib/data/chat/validateChatMessage';

/** Where one chosen file has got to: on its way to storage, arrived there ready to go on the message, or refused. */
export const chosenFileStates = { sending: 'sending', arrived: 'arrived', refused: 'refused' } as const;

export type ChosenFileState = (typeof chosenFileStates)[keyof typeof chosenFileStates];

export type ChosenFile = { key: number; fileName: string; state: ChosenFileState; problem: string | null; sent: ChatFileSent | null };

/**
 * The files chosen for the message being written, each sent to storage as soon as it is chosen, with where it has
 * got to. The same limits as the service, in the same sentences: how many a message carries, each file's size and kind.
 */
export class ChatAttachments {
	chosen = $state<ChosenFile[]>([]);
	refusal = $state<string | null>(null);
	private nextKey = 0;

	get isSending(): boolean {
		return this.chosen.some((file) => file.state === chosenFileStates.sending);
	}

	get filesSent(): ChatFileSent[] {
		return this.chosen.flatMap((file) => file.sent ?? []);
	}

	choose(files: File[]): void {
		const keptCount = this.chosen.filter((file) => file.state !== chosenFileStates.refused).length;
		const isTooMany = keptCount + files.length > chatFileLimits.mostFilesOnAMessage;
		this.refusal = isTooMany ? chatFileRefusals.tooManyFiles : null;
		if (isTooMany) return;
		for (const file of files) this.startSending(file);
	}

	takeOff(key: number): void {
		this.chosen = this.chosen.filter((file) => file.key !== key);
		this.refusal = null;
	}

	private startSending(file: File): void {
		const problem = chatFileRefusal({ fileName: file.name, contentType: file.type, sizeBytes: file.size });
		const state = problem === null ? chosenFileStates.sending : chosenFileStates.refused;
		this.chosen.push({ key: this.nextKey++, fileName: file.name, state, problem, sent: null });
		const chosenFile = this.chosen[this.chosen.length - 1];
		if (problem === null) void this.send(file, chosenFile);
	}

	private async send(file: File, chosenFile: ChosenFile): Promise<void> {
		const outcome = await sendChatFile(file).catch(() => couldNotBeSent);
		if (typeof outcome === 'string') {
			Object.assign(chosenFile, { state: chosenFileStates.refused, problem: outcome });
			return;
		}
		Object.assign(chosenFile, { state: chosenFileStates.arrived, sent: outcome });
	}
}
