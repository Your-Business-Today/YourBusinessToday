<script lang="ts">
	import Modal from '$lib/components/site/Modal.svelte';
	import { attachmentHref } from './attachmentLinks';
	import { attachmentPreviewKinds, previewKindFor } from '$lib/data/taskAttachmentRules';
	import type { TaskAttachment } from '$lib/server/projects/attachmentRecord';

	let {
		attachment,
		projectId,
		taskId,
		isOpen = $bindable()
	}: { attachment: TaskAttachment; projectId: string; taskId: string; isOpen: boolean } = $props();

	const openHref = $derived(attachmentHref(projectId, taskId, attachment.id, 'open'));
	const downloadHref = $derived(attachmentHref(projectId, taskId, attachment.id, 'download'));
	const previewKind = $derived(previewKindFor(attachment.mimeType));
</script>

<Modal title={attachment.filename} maxWidthClass="max-w-4xl" bind:isOpen>
	<div class="flex flex-col gap-4">
		{#if previewKind === attachmentPreviewKinds.image}
			<img src={openHref} alt={attachment.filename} class="mx-auto max-h-[70vh] rounded-xl" />
		{:else}
			<iframe
				src={openHref}
				title={attachment.filename}
				class="h-[75vh] w-full rounded-xl border border-hairline bg-chalk"
			></iframe>
		{/if}
		<div class="flex justify-end gap-3">
			<a
				href={openHref}
				target="_blank"
				rel="noreferrer"
				class="rounded-full border border-hairline px-5 py-2 font-display text-sm text-chalk/70
					transition hover:border-chalk/40 hover:text-chalk"
			>
				Open in new tab
			</a>
			<a
				href={downloadHref}
				class="rounded-full bg-go px-5 py-2 font-display text-sm font-medium text-night
					transition hover:brightness-110"
			>
				Download
			</a>
		</div>
	</div>
</Modal>
