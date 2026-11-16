<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { LeadQuoteVersion } from '$lib/data/leadQuoteRules';

	let { versions, shownVersion, pathOf }: { versions: LeadQuoteVersion[]; shownVersion: number; pathOf: (version: number) => string } =
		$props();
</script>

{#if versions.length > 1}
	<nav aria-label="Versions of this quote" class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-chalk-subtle print:hidden">
		<span>Versions:</span>
		{#each versions as entry (entry.version)}
			{#if entry.version === shownVersion}
				<span class="font-medium text-chalk">{entry.version}, {formatBritishDate(entry.filedAt)}</span>
			{:else}
				<a href={pathOf(entry.version)} class="underline hover:text-go">{entry.version}, {formatBritishDate(entry.filedAt)}</a>
			{/if}
		{/each}
	</nav>
{/if}
