<script lang="ts">
	import type { BreakdownRow, BreakdownRowKind } from '$lib/data/taxCalculator/breakdownRow';

	let { rows, label }: { rows: BreakdownRow[]; label: string } = $props();

	const rowClasses: Record<BreakdownRowKind, string> = {
		line: 'border-b border-hairline/70 text-chalk/75',
		detail: 'text-xs text-chalk/45',
		subtotal: 'border-b border-hairline font-medium text-chalk',
		total: 'font-display text-lg font-medium text-chalk'
	};
</script>

<table class="w-full text-sm" aria-label={label}>
	<tbody>
		{#each rows as row, rowIndex (rowIndex)}
			<tr class={rowClasses[row.kind]}>
				{#if row.amount === undefined}
					<td colspan="2" class="pb-2 pl-3">{row.label}</td>
				{:else}
					<td class={row.kind === 'total' ? 'pt-4 pr-4' : 'py-3 pr-4'}>{row.label}</td>
					<td class={`text-right font-mono whitespace-nowrap ${row.kind === 'total' ? 'pt-4 text-go' : 'py-3'}`}>{row.amount}</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>
