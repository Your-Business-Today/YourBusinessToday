<script lang="ts">
	import MinutesAnswerEntry from './MinutesAnswerEntry.svelte';
	import type { MinutesVersionView } from '$lib/data/boardMinutesViews';

	let { version, isLatest }: { version: MinutesVersionView; isLatest: boolean } = $props();

	const answers = $derived(version.answers);
</script>

<li class="flex flex-col gap-2 px-4 py-3">
	<p class="text-sm font-medium text-chalk">
		Version {version.number}{isLatest ? '' : ' (earlier)'}, written by {version.writerName} on {version.when}
	</p>
	<p class="text-sm break-words whitespace-pre-wrap text-chalk">{version.facts}</p>
	<p class="text-sm break-words whitespace-pre-wrap text-chalk">{version.words}</p>
	{#if answers.length > 0}
		<ul class="flex flex-col gap-2">
			{#each answers as answer (answer.directorName)}
				<MinutesAnswerEntry {answer} />
			{/each}
		</ul>
	{/if}
</li>
