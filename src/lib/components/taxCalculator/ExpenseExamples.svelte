<script lang="ts">
	import { disclosureClasses, disclosureSummaryClasses } from './calculatorStyles';
	import DisclosureMarker from './DisclosureMarker.svelte';

	const claimableExpenses = [
		'Tools and equipment — drills, saws, ladders, PPE',
		'Materials bought for jobs, where the customer does not cover them',
		'Phone — the business share, or all of a work phone',
		'Insurance — public liability, tools, professional indemnity',
		'Trade body subscriptions — Gas Safe, NICEIC, JIB, CSCS',
		'Accountant or bookkeeper fees',
		'Protective clothing — steel-toe boots, hi-vis, hard hats'
	];
</script>

<details class={disclosureClasses}>
	<summary class={disclosureSummaryClasses}>Not sure what counts as an expense? <DisclosureMarker /></summary>
	<ul class="mt-3 flex list-disc flex-col gap-1 pl-5">
		{#each claimableExpenses as expense (expense)}
			<li>{expense}</li>
		{/each}
	</ul>
	<p class="mt-3">
		<strong class="text-chalk">You can’t claim:</strong> commuting, everyday clothes, fines or entertaining clients.
	</p>
</details>
