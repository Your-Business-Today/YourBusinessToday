<script lang="ts">
	import { wireframeShapes, type WireframeShape } from '$lib/data/blueprint/wireframeShapes';

	let { shape }: { shape: WireframeShape } = $props();

	const tableRows = [0, 1, 2];
	const fewMarks = [0, 1, 2];
	const pagerDots = [0, 1, 2, 3];
</script>

{#if shape === wireframeShapes.title}
	<div class="h-2 w-1/2 rounded-sm bg-chalk/60"></div>
{:else if shape === wireframeShapes.table}
	<div class="flex flex-col gap-0.5">
		<div class="h-1.5 rounded-sm bg-chalk/40"></div>
		{#each tableRows as row (row)}
			<div class="h-1.5 rounded-sm bg-chalk/15"></div>
		{/each}
	</div>
{:else if shape === wireframeShapes.field}
	<div class="h-2.5 rounded-sm border border-chalk/30"></div>
{:else if shape === wireframeShapes.button}
	<div class="h-2 w-8 rounded-full bg-go/70"></div>
{:else if shape === wireframeShapes.notice}
	<div class="h-2 rounded-sm bg-caution/40"></div>
{:else if shape === wireframeShapes.chips}
	<div class="flex gap-0.5">
		{#each fewMarks as mark (mark)}<div class="h-1.5 w-4 rounded-full bg-chalk/30"></div>{/each}
	</div>
{:else if shape === wireframeShapes.pager}
	<div class="flex justify-center gap-0.5">
		{#each pagerDots as dot (dot)}<div class="h-1 w-1 rounded-full bg-chalk/40"></div>{/each}
	</div>
{:else if shape === wireframeShapes.empty}
	<div class="h-5 rounded-sm border border-dashed border-chalk/30"></div>
{:else if shape === wireframeShapes.tabs}
	<div class="flex gap-0.5 border-b border-chalk/20 pb-0.5">
		{#each fewMarks as mark (mark)}<div class="h-1.5 w-5 rounded-sm bg-chalk/30"></div>{/each}
	</div>
{:else if shape === wireframeShapes.icon}
	<div class="h-2 w-2 rounded-full bg-chalk/40"></div>
{:else if shape === wireframeShapes.lines}
	<div class="flex flex-col gap-0.5">
		{#each fewMarks as mark (mark)}<div class="h-1 w-5/6 rounded-sm bg-chalk/20"></div>{/each}
	</div>
{:else}
	<div class="h-2.5 rounded-sm bg-chalk/15"></div>
{/if}
