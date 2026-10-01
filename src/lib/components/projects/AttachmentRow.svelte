<script lang="ts">
	import AttachmentPreviewModal from './AttachmentPreviewModal.svelte';
	import AttachmentThumbnail from './AttachmentThumbnail.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { attachmentHref } from './attachmentLinks';
	import { describeByteCount, previewKindFor } from '$lib/data/taskAttachmentRules';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { TaskAttachment } from '$lib/server/projects/attachmentRecord';

	let {
		attachment,
		projectId,
		taskId
	}: {
		attachment: TaskAttachment & { uploaderName: string };
		projectId: string;
		taskId: string;
	} = $props();

	let isPreviewOpen = $state(false);
	let isRemoveModalOpen = $state(false);

	const canPreview = $derived(previewKindFor(attachment.mimeType) !== null);
	const filenameClasses = 'truncate text-left font-display text-chalk transition hover:text-go';
</script>

<li class="flex items-center gap-3 px-4 py-2.5">
	<AttachmentThumbnail {attachment} {projectId} {taskId} />
	<div class="flex min-w-0 flex-1 flex-col gap-0.5">
		{#if canPreview}
			<button type="button" onclick={() => (isPreviewOpen = true)} class={filenameClasses}>
				{attachment.filename}
			</button>
		{:else}
			<a
				href={attachmentHref(projectId, taskId, attachment.id, 'open')}
				target="_blank"
				rel="noreferrer"
				class={filenameClasses}
			>
				{attachment.filename}
			</a>
		{/if}
		<p class="text-xs text-chalk/50">
			{describeByteCount(attachment.byteCount)}
			· <span class="text-chalk/80">{attachment.uploaderName}</span>
			· {formatBritishDate(attachment.createdAt)}
		</p>
	</div>
	<div class="flex shrink-0 items-center gap-2">
		<a
			href={attachmentHref(projectId, taskId, attachment.id, 'download')}
			class="rounded-full border border-hairline px-3 py-1 font-display text-xs text-chalk/60
				transition hover:border-chalk/40 hover:text-chalk"
		>
			Download
		</a>
		<button
			type="button"
			onclick={() => (isRemoveModalOpen = true)}
			aria-label={`Remove “${attachment.filename}”`}
			class="px-1 text-chalk/40 transition hover:text-signal"
		>
			✕
		</button>
	</div>
</li>

{#if canPreview}
	<AttachmentPreviewModal {attachment} {projectId} {taskId} bind:isOpen={isPreviewOpen} />
{/if}

<DangerConfirmModal
	title="Remove attachment"
	description={`This permanently deletes “${attachment.filename}” from the task. This cannot be undone.`}
	action="?/deleteAttachment"
	fields={{ attachmentId: attachment.id }}
	submitLabel="Remove file"
	bind:isOpen={isRemoveModalOpen}
/>
