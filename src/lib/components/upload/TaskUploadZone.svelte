<script lang="ts">
	import { attachmentLimitDescription } from '$lib/data/taskAttachmentRules';
	import { renamedIfFromClipboard } from '$lib/uploadBox/boxFiles.js';

	let { onFilesGiven }: { onFilesGiven: (files: File[]) => void } = $props();

	let isDraggedOver = $state(false);

	function takeChosenFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		onFilesGiven(Array.from(input.files ?? []));
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
		onFilesGiven(Array.from(dataTransfer?.files ?? []));
	}

	function takePastedFiles(event: ClipboardEvent) {
		const { clipboardData } = event;
		const pastedAt = new Date();
		const pastedFiles = Array.from(clipboardData?.files ?? []);
		onFilesGiven(pastedFiles.map((file) => renamedIfFromClipboard(file, pastedAt)));
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
	<p class="text-chalk/70">Drop files anywhere on this page, paste an image, or</p>
	<label
		class="cursor-pointer rounded-lg bg-go px-6 py-3 font-display font-medium text-night transition
			focus-within:ring-2 focus-within:ring-chalk hover:brightness-110"
	>
		<input type="file" multiple onchange={takeChosenFiles} class="sr-only" />
		Choose files
	</label>
	<p class="text-xs text-chalk/50">
		{attachmentLimitDescription()} Each one goes straight onto the task, at full quality.
	</p>
</div>
