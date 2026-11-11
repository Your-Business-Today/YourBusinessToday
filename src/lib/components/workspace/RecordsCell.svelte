<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		bodyCellClasses,
		cellKindClasses,
		figureToneClasses,
		unlabelledCellClasses,
		wideOnlyCellClasses,
		type FigureTone,
		type RecordsCellKind
	} from './recordsTableStyles';

	let {
		kind = 'text',
		href,
		tone = 'plain',
		isWideOnly = false,
		label,
		children
	}: {
		kind?: RecordsCellKind;
		href?: string;
		tone?: FigureTone;
		isWideOnly?: boolean;
		label?: string;
		children: Snippet;
	} = $props();
</script>

<td data-label={label} class={[bodyCellClasses, cellKindClasses[kind], figureToneClasses[tone], isWideOnly && wideOnlyCellClasses, label === undefined && unlabelledCellClasses]}>
	{#if href === undefined}
		{@render children()}
	{:else}
		<a {href} class="hover:underline">{@render children()}</a>
	{/if}
</td>
