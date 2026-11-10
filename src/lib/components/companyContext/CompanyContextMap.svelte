<script lang="ts">
	import ContextAreaRegion from './ContextAreaRegion.svelte';
	import ContextLinkLine from './ContextLinkLine.svelte';
	import ContextPartNode from './ContextPartNode.svelte';
	import { layOutContextMap } from '$lib/data/companyContext/contextMapLayout';
	import { partKeysLinkedTo } from '$lib/data/companyContext/contextLinks';
	import type { CompanyContextVersion, ContextLink } from '$lib/data/companyContext/companyContext';

	let {
		context,
		columns,
		selectedKey,
		onSelect
	}: { context: CompanyContextVersion; columns: number; selectedKey: string | null; onSelect: (partKey: string) => void } =
		$props();

	const arrowId = $props.id();
	const layout = $derived(layOutContextMap(context, columns));
	const placedByKey = $derived(new Map(layout.parts.map((placed) => [placed.key, placed])));
	const lines = $derived(context.links.flatMap(placedLine));
	const linkedKeys = $derived(selectedKey === null ? new Set<string>() : partKeysLinkedTo(context, selectedKey));

	function placedLine(link: ContextLink) {
		const from = placedByKey.get(link.fromKey);
		const to = placedByKey.get(link.toKey);
		if (from === undefined || to === undefined) return [];
		return [{ key: `${link.fromKey} ${link.kind} ${link.toKey}`, from, to, link }];
	}

	function isTouchingSelection(link: ContextLink): boolean {
		return link.fromKey === selectedKey || link.toKey === selectedKey;
	}
</script>

<div class="overflow-x-auto rounded-xl border border-hairline bg-night">
	<svg
		viewBox={`0 0 ${layout.width} ${layout.height}`}
		class="block h-auto w-full"
		role="img"
		aria-label="The areas of the business, the parts in each and the links between them"
	>
		<defs>
			<marker id={arrowId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
				<path d="M 0 0 L 8 4 L 0 8 z" class="fill-chalk/40" />
			</marker>
		</defs>
		{#each layout.areas as placed (placed.key)}
			<ContextAreaRegion {placed} isSelected={placed.key === selectedKey} {onSelect} />
		{/each}
		{#each lines as line (line.key)}
			<ContextLinkLine from={line.from} to={line.to} {arrowId} isHighlighted={isTouchingSelection(line.link)} />
		{/each}
		{#each layout.parts as placed (placed.key)}
			<ContextPartNode
				{placed}
				isSelected={placed.key === selectedKey}
				isLinked={linkedKeys.has(placed.key)}
				onSelect={() => onSelect(placed.key)}
			/>
		{/each}
	</svg>
</div>
