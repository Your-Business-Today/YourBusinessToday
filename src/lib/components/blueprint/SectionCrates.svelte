<script lang="ts">
	import { everySection } from './siteMapSections';

	type Crate = { section: string; count: number };

	let {
		crates,
		everyLabel,
		label,
		chosenSection = $bindable()
	}: { crates: Crate[]; everyLabel: string; label: string; chosenSection: string } = $props();
</script>

<div role="tablist" aria-label={label} class="scrollbar-hidden flex gap-1.5 overflow-x-auto pb-1">
	{#each crates as crate (crate.section)}
		{@const isChosen = crate.section === chosenSection}
		<button
			type="button"
			role="tab"
			aria-selected={isChosen}
			onclick={() => (chosenSection = crate.section)}
			class={[
				'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs transition',
				isChosen ? 'border-go bg-go text-night' : 'border-hairline text-chalk/70 hover:border-go hover:text-go'
			]}
		>
			{crate.section === everySection ? everyLabel : crate.section}
			<span class={isChosen ? 'text-night/70' : 'text-chalk/40'}>{crate.count}</span>
		</button>
	{/each}
</div>
