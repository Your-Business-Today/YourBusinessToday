<script lang="ts">
	import WireframeNode from './WireframeNode.svelte';
	import { parseWidgetNotation } from '$lib/data/blueprint/widgetNotation';

	let { layout }: { layout: string } = $props();

	const tree = $derived(parseWidgetNotation(layout));
</script>

<div class="flex flex-col gap-1 p-1.5" aria-hidden="true">
	<WireframeNode node={tree} depth={0} />
</div>
