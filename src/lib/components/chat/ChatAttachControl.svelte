<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import ChatChosenFiles from './ChatChosenFiles.svelte';
	import { ChatAttachments } from './chatAttachments.svelte';
	import { chatFileLimits, chatFileTypes, chatPictureTypes } from '$lib/data/chat/chatFileRules';

	let { isSending = $bindable(false), hasFiles = $bindable(false) }: { isSending?: boolean; hasFiles?: boolean } = $props();

	const attachments = new ChatAttachments();
	const { mostFilesOnAMessage, largestMegabytes } = chatFileLimits;

	let fileInput = $state<HTMLInputElement | null>(null);
	let cameraInput = $state<HTMLInputElement | null>(null);

	const filesSent = $derived(attachments.filesSent);
	const filesSentAsText = $derived(JSON.stringify(filesSent));

	function chooseFrom(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		attachments.choose([...(input.files ?? [])]);
		input.value = '';
	}

	$effect(() => {
		isSending = attachments.isSending;
		hasFiles = filesSent.length > 0;
	});
</script>

<div class="flex flex-col gap-2">
	<input type="hidden" name="files" value={filesSentAsText} />
	<input bind:this={fileInput} type="file" multiple accept={chatFileTypes.join(',')} class="hidden" onchange={chooseFrom} />
	<input bind:this={cameraInput} type="file" accept={chatPictureTypes.join(',')} capture="environment" class="hidden" onchange={chooseFrom} />
	<div class="flex flex-wrap items-center gap-2">
		<Button onclick={() => fileInput?.click()}>Attach files</Button>
		<Button onclick={() => cameraInput?.click()}>Take a photo</Button>
		<span class="text-xs text-chalk-subtle">Up to {mostFilesOnAMessage} photos or documents, each up to {largestMegabytes} MB</span>
	</div>
	<ChatChosenFiles chosen={attachments.chosen} onTakeOff={(key) => attachments.takeOff(key)} />
	<FormErrorNote message={attachments.refusal} />
</div>
