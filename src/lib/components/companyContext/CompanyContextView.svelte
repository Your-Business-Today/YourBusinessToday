<script lang="ts">
	import CompanyContextMap from './CompanyContextMap.svelte';
	import ContextChangesPanel from './ContextChangesPanel.svelte';
	import ContextConfirmationPanel from './ContextConfirmationPanel.svelte';
	import ContextPartPanel from './ContextPartPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import { contextMapColumns } from '$lib/data/companyContext/contextMapLayout';
	import { dashboardGridClasses } from '$lib/components/workspace/workspaceStyles';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { reviewTallySentence, tallyReviews } from '$lib/data/companyContext/reviewTally';
	import { tick } from 'svelte';
	import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';
	import type { ContextChanges } from '$lib/data/companyContext/contextChanges';
	import type { ContextConfirmation } from '$lib/data/companyContext/contextConfirmation';

	let {
		context,
		changes,
		confirmation,
		canMark
	}: {
		context: CompanyContextVersion;
		changes: ContextChanges | null;
		confirmation: ContextConfirmation | null;
		canMark: boolean;
	} = $props();

	const phoneWidth = 640;
	let windowWidth = $state(phoneWidth * 2);
	let selectedKey = $state<string | null>(null);
	let panel = $state<HTMLElement | null>(null);

	const isNarrow = $derived(windowWidth < phoneWidth);
	const columns = $derived(isNarrow ? contextMapColumns.narrow : contextMapColumns.wide);
	const selectedPart = $derived(context.parts.find((part) => part.key === selectedKey));
	const recordedDay = $derived(formatBritishDate(context.recordedAt));
	const tally = $derived(tallyReviews(context.parts));
	const isConfirmed = $derived(confirmation !== null);
	const canMarkParts = $derived(canMark && !isConfirmed);
	const markInvitation = $derived(canMarkParts ? ' Then say whether it is right.' : '');

	async function select(partKey: string) {
		selectedKey = partKey;
		await tick();
		if (isNarrow) panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<p class="text-sm text-chalk/60">
	Version {context.versionNumber}, recorded {recordedDay}. Each region is an area of the business, ★ the core one;
	inside it are the sources, records, processes and roles nearest it, and the arrows are the links between them. A
	dashed box is one Claude is unsure of. Pick any part to see what it is, where Claude saw it and how sure it is.{markInvitation}
</p>
<p class="text-sm text-chalk/80">{reviewTallySentence(tally)}</p>
<div class={dashboardGridClasses}>
	<CompanyContextMap {context} {columns} {selectedKey} onSelect={select} />
	<aside bind:this={panel} class="flex min-w-0 scroll-mt-4 flex-col gap-4">
		{#if selectedPart === undefined}
			<EmptyState message="Pick a part on the map." />
		{:else}
			<ContextPartPanel part={selectedPart} {context} canMark={canMarkParts} onSelect={select} />
		{/if}
		<ContextConfirmationPanel {tally} versionNumber={context.versionNumber} {confirmation} isClient={canMark} />
		{#if changes !== null}
			<ContextChangesPanel {changes} onSelect={select} />
		{/if}
	</aside>
</div>
