<script lang="ts">
	import { attachmentLimitDescription } from '$lib/data/taskAttachmentRules';
	import { notAnImageOrFile, pasteNoteFor } from './pasteNotes';
	import { readClipboardImages } from '$lib/uploadBox/boxClipboard.js';
	import { renamedIfFromClipboard } from '$lib/uploadBox/boxFiles.js';

	let { onFilesGiven }: { onFilesGiven: (files: File[]) => void } = $props();

	let isDraggedOver = $state(false);
	let pasteNote = $state<string | null>(null);

	function takeFiles(files: File[]) {
		pasteNote = null;
		onFilesGiven(files);
	}

	function takeChosenFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		takeFiles(Array.from(input.files ?? []));
		input.value = '';
	}

	function holdDraggedFiles(event: DragEvent) {
		event.preventDefault();
		isDraggedOver = true;
	}

	function releaseDraggedFiles(event: DragEvent) {
		const hasLeftThePage = event.relatedTarget === null;
		if (hasLeftThePage) isDraggedOver = false;
	}

	function takeDroppedFiles(event: DragEvent) {
		event.preventDefault();
		isDraggedOver = false;
		const { dataTransfer } = event;
		takeFiles(Array.from(dataTransfer?.files ?? []));
	}

	function takePastedFiles(event: ClipboardEvent) {
		const { clipboardData } = event;
		const pastedAt = new Date();
		const pastedFiles = Array.from(clipboardData?.files ?? []);
		if (pastedFiles.length === 0) {
			pasteNote = notAnImageOrFile;
			return;
		}
		takeFiles(pastedFiles.map((file) => renamedIfFromClipboard(file, pastedAt)));
	}

	async function pasteFromClipboard() {
		const reading = await readClipboardImages(new Date());
		takeFiles(reading.files);
		pasteNote = pasteNoteFor(reading);
	}
</script>

<svelte:window
	ondragover={holdDraggedFiles}
	ondragleave={releaseDraggedFiles}
	ondrop={takeDroppedFiles}
/>
<svelte:document onpaste={takePastedFiles} />

<div
	class={[
		'flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
		isDraggedOver ? 'border-go bg-go/10' : 'border-hairline bg-carriage'
	]}
>
	<p class="text-chalk/70">Drop files anywhere on this page, or</p>
	<div class="flex flex-wrap justify-center gap-3">
		<label
			class="cursor-pointer rounded-lg bg-go px-6 py-3 font-display font-medium text-night transition
				focus-within:ring-2 focus-within:ring-chalk hover:brightness-110"
		>
			<input type="file" multiple onchange={takeChosenFiles} class="sr-only" />
			Choose files
		</label>
		<button
			type="button"
			onclick={pasteFromClipboard}
			class="rounded-lg border border-hairline px-6 py-3 font-display font-medium text-chalk transition
				hover:border-chalk/60 focus-visible:ring-2 focus-visible:ring-chalk"
		>
			Paste image
		</button>
	</div>
	{#if pasteNote !== null}
		<p class="text-sm text-caution">{pasteNote}</p>
	{/if}
	<p class="text-xs text-chalk/50">
		{attachmentLimitDescription()} Each one goes straight onto the task, at full quality.
	</p>
</div>
