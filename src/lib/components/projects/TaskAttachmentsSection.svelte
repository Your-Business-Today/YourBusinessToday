<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import AttachmentRow from './AttachmentRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { attachmentLimitDescription } from '$lib/data/taskAttachmentRules';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import { uploadTaskAttachment } from './uploadTaskAttachment';
	import type { TaskAttachment } from '$lib/server/projects/attachmentRecord';

	let {
		attachments,
		projectId,
		taskId
	}: {
		attachments: (TaskAttachment & { uploaderName: string })[];
		projectId: string;
		taskId: string;
	} = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let uploadingLabel = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	async function uploadChosenFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		errorMessage = null;
		for (const [index, file] of files.entries()) {
			uploadingLabel = progressLabel(index, files.length, file.name);
			const outcome = await uploadTaskAttachment(file);
			if (outcome.status === 'failed') {
				errorMessage = `${file.name}: ${outcome.message}`;
				break;
			}
		}
		uploadingLabel = null;
		await invalidateAll();
	}

	function progressLabel(index: number, fileCount: number, filename: string): string {
		if (fileCount === 1) return `Uploading ${filename}…`;
		return `Uploading ${index + 1} of ${fileCount} — ${filename}…`;
	}
</script>

<DashboardPanel title="Attachments" count={attachments.length}>
	{#snippet actions()}
		<input bind:this={fileInput} type="file" multiple onchange={uploadChosenFiles} class="hidden" />
		<button
			type="button"
			disabled={uploadingLabel !== null}
			onclick={() => fileInput?.click()}
			class={`max-w-xs truncate ${panelButtonClasses}`}
		>
			{uploadingLabel ?? '＋ File'}
		</button>
	{/snippet}
	{#if attachments.length === 0}
		<p class={panelEmptyClasses}>
			No attachments yet — add a spec, a screenshot, or an export. {attachmentLimitDescription()}
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each attachments as attachment (attachment.id)}
				<AttachmentRow {attachment} {projectId} {taskId} />
			{/each}
		</ul>
	{/if}
	{#if errorMessage !== null}
		<div class="px-4 pb-3"><FormErrorNote message={errorMessage} /></div>
	{/if}
</DashboardPanel>
