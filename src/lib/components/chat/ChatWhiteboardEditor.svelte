<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChatWhiteboardCanvas from './ChatWhiteboardCanvas.svelte';
	import ChatWhiteboardTextField from './ChatWhiteboardTextField.svelte';
	import ChatWhiteboardToolbar from './ChatWhiteboardToolbar.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { WhiteboardBoard } from './whiteboardBoard.svelte';
	import { WhiteboardSaver, type WhiteboardPlaces } from './whiteboardSaving.svelte';
	import { chatWhiteboardLimits, type OpenedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';
	import { lastSavedSentence } from '$lib/data/chat/chatWhiteboardWords';
	import { paletteAt } from './whiteboardRendering';
	import { untrack } from 'svelte';

	let { opened, places, isArchived }: { opened: OpenedChatWhiteboard; places: WhiteboardPlaces; isArchived: boolean } = $props();

	const openedAs = untrack(() => opened);
	const board = new WhiteboardBoard(openedAs.items);
	const saver = new WhiteboardSaver(openedAs);

	let title = $state(openedAs.title);

	const savedLine = $derived(lastSavedSentence({ ...openedAs, lastSavedByName: saver.lastSavedByName, updatedAt: saver.openedAsSavedAt }));
	const statusLine = $derived(board.isUnsaved ? `${savedLine} You have changes not saved yet.` : savedLine);
	const problem = $derived(saver.refusal ?? board.notice);

	async function keep(work: (items: OpenedChatWhiteboard['items']) => Promise<unknown>) {
		const items = board.drawnItems;
		await saver.run(async () => {
			await work(items);
			const isSaved = saver.refusal === null;
			if (isSaved && board.drawnItems === items) board.isUnsaved = false;
		});
	}

	const save = () => keep((items) => saver.save(title, items));
	const postToRoom = () => keep((items) => saver.postToRoom(title, items, paletteAt(document.documentElement), places));
</script>

<DashboardPanel isPadded>
	{#snippet toolbar()}
		<p class="text-sm text-chalk-subtle">{statusLine}</p>
	{/snippet}
	<div class="flex flex-col gap-4">
		<FormField label="Title">
			<input bind:value={title} required maxlength={chatWhiteboardLimits.longestTitle} autocomplete="off" readonly={isArchived} />
		</FormField>
		{#if !isArchived}
			<ChatWhiteboardToolbar {board} />
		{/if}
		<ChatWhiteboardCanvas {board} {title} isDisabled={isArchived || saver.isSaving} />
		{#if board.textAt !== null}
			<ChatWhiteboardTextField {board} />
		{/if}
		<FormErrorNote message={problem} />
		{#if saver.notice !== null}
			<p class="text-sm text-go" role="status">{saver.notice}</p>
		{/if}
		{#if !isArchived}
			<div class="flex flex-wrap justify-end gap-2">
				<Button isSaving={saver.isSaving} savingLabel="Saving…" onclick={save}>Save</Button>
				<Button look="primary" isSaving={saver.isSaving} savingLabel="Saving…" onclick={postToRoom}>Post to the room</Button>
			</div>
		{/if}
	</div>
</DashboardPanel>
