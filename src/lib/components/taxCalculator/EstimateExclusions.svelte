<script lang="ts">
	import DisclosureMarker from './DisclosureMarker.svelte';
	import { disclosureSummaryClasses } from './calculatorStyles';

	const exclusions = [
		{ name: 'Other income', effect: 'dividends, rent, savings interest or foreign income.' },
		{ name: 'Capital allowances', effect: 'relief on bigger purchases such as vans, machinery or computers.' },
		{ name: 'Salary sacrifice', effect: 'pensions or benefits that reduce your pay before National Insurance.' },
		{ name: 'Marriage Allowance', effect: 'moving part of a personal allowance between spouses.' },
		{ name: 'Losses against other income', effect: 'setting a trading loss against your salary.' },
		{ name: 'Other business types', effect: 'limited companies, partnerships and landlords.' },
		{ name: 'Voluntary National Insurance', effect: 'for periods spent working abroad.' }
	];
</script>

<details class="group border-t border-hairline pt-4 text-sm">
	<summary class={disclosureSummaryClasses}>What this estimate doesn’t include <DisclosureMarker /></summary>
	<ul class="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-chalk/70">
		{#each exclusions as exclusion (exclusion.name)}
			<li><strong class="text-chalk">{exclusion.name}</strong> — {exclusion.effect}</li>
		{/each}
	</ul>
	<p class="mt-3 text-chalk/70">If any of these apply, your real figures will differ. An accountant can give you the full picture.</p>
</details>
