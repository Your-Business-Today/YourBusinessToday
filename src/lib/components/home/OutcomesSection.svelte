<script lang="ts">
	import CapabilityRow from './CapabilityRow.svelte';
	import { operatingOutcomes } from '$lib/data/operatingOutcomes';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">The outcomes</p>
		<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-5xl">
			From information to intelligence. From workflows to outcomes.
		</h2>
		<div class="mt-14 border-t border-hairline md:mt-16">
			{#each operatingOutcomes as outcome (outcome.id)}
				<CapabilityRow name={outcome.name} description={outcome.description} />
			{/each}
		</div>
		<a
			href="/contact"
			class="mt-10 inline-block rounded-full border border-hairline px-6 py-2.5 font-display
				text-sm text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
		>
			Identify your highest-value workflows
		</a>
	</div>
</section>
