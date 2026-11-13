<script lang="ts">
	import type { LineMapGeometry } from './layout/lineMapGeometry';
	import { lineStrokeClasses } from './lineColourClasses';
	import type { LineMapDrawing } from './lineMapDrawing';
	import { pathThrough } from './lineMapPaths';

	let { drawing, geometry, isDimmed }: { drawing: LineMapDrawing; geometry: LineMapGeometry; isDimmed: boolean } = $props();

	const arrivingWidth = 2;
	const failingBranches = $derived(drawing.branches.filter((branch) => branch.failure !== undefined));
</script>

<g class={isDimmed ? 'opacity-40' : ''} fill="none" stroke-linecap="round" stroke-linejoin="round">
	{#each drawing.branches as branch (`${branch.from}→${branch.to}`)}
		<path d={pathThrough(branch.corners)} class={lineStrokeClasses[branch.colour]} stroke-width={geometry.stroke} />
	{/each}
	{#each drawing.runs as run (run.lineId)}
		<path d="M{run.from} {run.y}H{run.to}" class={lineStrokeClasses[run.colour]} stroke-width={geometry.stroke} />
	{/each}
	{#each drawing.branches as branch (`${branch.from}→${branch.to}`)}
		<path d={pathThrough(branch.corners.slice(-2))} class={lineStrokeClasses[branch.colour]} stroke-width={arrivingWidth} />
	{/each}
</g>
{#each failingBranches as branch (`${branch.from}→${branch.to}`)}
	{@const { x, y } = branch.joinsAt}
	<g>
		<title>{branch.failure}</title>
		<circle cx={x} cy={y} r="8.5" class="fill-signal stroke-carriage" stroke-width="2.5" />
		<rect x={x - 1} y={y - 4.5} width="2" height="5.5" rx="1" class="fill-night" />
		<circle cx={x} cy={y + 3.2} r="1.2" class="fill-night" />
	</g>
{/each}
