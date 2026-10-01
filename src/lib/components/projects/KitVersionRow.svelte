<script lang="ts">
	import KitVersionBadge from './KitVersionBadge.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { webAddressLabel } from '$lib/data/webAddressLabel';
	import type { KitVersionEntry } from '$lib/server/kit/getKitVersionRegister';

	let { entry, latestKitVersion }: { entry: KitVersionEntry; latestKitVersion: string } = $props();

	const highlightClasses = $derived(entry.standing === 'behind' ? 'bg-caution/5' : '');
	const readTimeLabel = $derived(
		entry.kitVersionReadAt === null ? 'never read' : `read ${formatBritishDateTime(entry.kitVersionReadAt)}`
	);
</script>

<li class={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 ${highlightClasses}`}>
	<div class="flex min-w-0 flex-col">
		<a href={`/projects/${entry.projectId}`} class="truncate font-display text-sm transition hover:text-go">
			{entry.projectName}
		</a>
		<a
			href={entry.repositoryUrl}
			target="_blank"
			rel="noopener"
			class="truncate text-xs text-chalk/50 transition hover:text-go"
		>
			{webAddressLabel(entry.repositoryUrl)} ↗
		</a>
	</div>
	<div class="flex items-center gap-3">
		<span class="text-xs text-chalk/40">{readTimeLabel}</span>
		<KitVersionBadge repositoryUrl={entry.repositoryUrl} kitVersion={entry.kitVersion} {latestKitVersion} />
	</div>
</li>
