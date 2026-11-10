<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		bodyCellClasses,
		cellKindClasses,
		figureToneClasses,
		wideOnlyCellClasses,
		type FigureTone,
		type RecordsCellKind
	} from './recordsTableStyles';

	let {
		kind = 'text',
		href,
		tone = 'plain',
		isWideOnly = false,
		children
	}: { kind?: RecordsCellKind; href?: string; tone?: FigureTone; isWideOnly?: boolean; children: Snippet } =
		$props();
</script>

<td class={[bodyCellClasses, cellKindClasses[kind], figureToneClasses[tone], isWideOnly && wideOnlyCellClasses]}>
	{#if href === undefined}
		{@render children()}
	{:else}
		<a {href} class="hover:underline">{@render children()}</a>
	{/if}
</td>
