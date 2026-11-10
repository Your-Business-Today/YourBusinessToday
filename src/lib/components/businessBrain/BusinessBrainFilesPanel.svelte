<script lang="ts">
	import BusinessBrainFileRow from './BusinessBrainFileRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { filesListedSentence } from './businessBrainSentences';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { KeptBusinessBrainFile } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';

	let {
		title,
		files,
		fileCount,
		emptyMessage = '',
		addresses
	}: {
		title: string;
		files: KeptBusinessBrainFile[];
		fileCount: number;
		emptyMessage?: string;
		addresses: BusinessBrainAddresses;
	} = $props();

	const hasMoreFiles = $derived(files.length < fileCount);
</script>

<DashboardPanel {title} count={fileCount}>
	{#if files.length === 0}
		<p class={panelEmptyClasses}>{emptyMessage}</p>
	{:else}
		<ul class={panelListClasses}>
			{#each files as file (file.fileId)}
				<BusinessBrainFileRow {file} href={addresses.file(file.fileId)} />
			{/each}
		</ul>
		{#if hasMoreFiles}
			<p class={panelEmptyClasses}>{filesListedSentence(files.length, fileCount)}</p>
		{/if}
	{/if}
</DashboardPanel>
