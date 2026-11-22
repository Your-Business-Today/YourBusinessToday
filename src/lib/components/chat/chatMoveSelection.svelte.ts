import { SvelteSet } from 'svelte/reactivity';
import { messagesFromHereOnwards } from '$lib/data/chat/chatMoveChoices';

type Listed = { id: string };

/**
 * The messages a reader has ticked to move while Move mode is on. It lives as long as the open room does, so the
 * room reading itself again every few seconds leaves the ticks where they are.
 */
export class ChatMoveSelection {
	isMoving = $state(false);
	#chosenIds = new SvelteSet<string>();

	start(): void {
		this.isMoving = true;
	}

	end(): void {
		this.isMoving = false;
		this.#chosenIds.clear();
	}

	isChosen(messageId: string): boolean {
		return this.#chosenIds.has(messageId);
	}

	toggle(messageId: string): void {
		const wasChosen = this.#chosenIds.delete(messageId);
		if (!wasChosen) this.#chosenIds.add(messageId);
	}

	chooseFromHereOnwards(messages: Listed[], pickedMessageId: string): void {
		for (const message of messagesFromHereOnwards(messages, pickedMessageId)) this.#chosenIds.add(message.id);
	}

	/** The ticked messages still in the room, in the room's order: one moved away by someone else drops out. */
	chosenAmong(messages: Listed[]): string[] {
		return messages.filter((message) => this.#chosenIds.has(message.id)).map((message) => message.id);
	}
}
