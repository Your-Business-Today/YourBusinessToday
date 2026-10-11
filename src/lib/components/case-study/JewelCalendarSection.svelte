<script lang="ts">
	import BuildPhaseRow from './BuildPhaseRow.svelte';
	import { jewelBuildPhases } from '$lib/data/jewelBuild';
</script>

<section class="mx-auto max-w-4xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The calendar</p>
	<h2 class="mt-5 font-display text-3xl leading-tight font-medium md:text-4xl">
		How the sixteen weeks went.
	</h2>
	<div class="mt-12 border-t border-hairline">
		{#each jewelBuildPhases as phase (phase.id)}
			<BuildPhaseRow {phase} />
		{/each}
	</div>
</section>
