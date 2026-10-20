<script lang="ts">
	import { enhance } from '$app/forms';
	import DemoActivityRow from './DemoActivityRow.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { DemoLogEntry } from '$lib/data/demo/demoBusiness';

	let { log }: { log: DemoLogEntry[] } = $props();

	let isStartingAgain = $state(false);
	const newestFirst = $derived([...log].reverse());

	function startAgain() {
		isStartingAgain = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isStartingAgain = false;
		};
	}
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">What has happened here</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium">
			Everything your Claude has done on this copy.
		</h2>
		<ul class="mt-8 flex flex-col gap-2">
			{#each newestFirst as entry, index (index)}
				<DemoActivityRow {entry} />
			{/each}
		</ul>
		<form method="POST" action="?/startAgain" use:enhance={startAgain} class="mt-8">
			<SubmitButton isSaving={isStartingAgain} savingLabel="Starting again…" class={quietButtonClasses}>
				Start the demo again
			</SubmitButton>
		</form>
	</div>
</section>
