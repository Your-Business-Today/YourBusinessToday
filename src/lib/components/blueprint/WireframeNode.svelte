<script lang="ts">
	import Self from './WireframeNode.svelte';
	import WireframeShape from './WireframeShape.svelte';
	import { copiesOfRepeat, wireframeShapeOf, wireframeShapes } from '$lib/data/blueprint/wireframeShapes';
	import { widgetNodeKinds, type WidgetNode } from '$lib/data/blueprint/widgetNode';

	let { node, depth }: { node: WidgetNode; depth: number } = $props();

	const deepestDrawn = 8;
	const optionsDrawn = 1;
	const borderlessWidgetName = 'Page';

	const children = $derived(node.children);
	const isWidget = $derived(node.kind === widgetNodeKinds.widget);
	const copies = $derived(Array.from({ length: copiesOfRepeat(node.repeat) }, (_, index) => index));
	const shape = $derived(wireframeShapeOf(node.name, children.length > 0));
	const isContainer = $derived(!isWidget || shape === wireframeShapes.box);
	const shownChildren = $derived(node.kind === widgetNodeKinds.choice ? children.slice(0, optionsDrawn) : children);

	function markClasses(): string {
		const conditional = node.condition === null ? '' : 'opacity-70';
		const handWritten = node.isHandWritten ? 'outline outline-1 outline-signal' : '';
		return `${conditional} ${handWritten}`;
	}

	function containerClasses(): string {
		const direction = node.kind === widgetNodeKinds.row ? 'flex-row [&>*]:flex-1' : 'flex-col';
		const isBordered = isWidget && node.name !== borderlessWidgetName;
		const border = isBordered ? 'rounded border border-chalk/20 p-1' : '';
		return `flex min-w-0 gap-1 ${direction} ${border} ${markClasses()}`;
	}
</script>

{#if depth <= deepestDrawn}
	{#each copies as copy (copy)}
		{#if isContainer}
			<div class={containerClasses()}>
				{#each shownChildren as child, index (index)}
					<Self node={child} depth={depth + 1} />
				{/each}
			</div>
		{:else}
			<div class={markClasses()}><WireframeShape {shape} /></div>
		{/if}
	{/each}
{/if}
