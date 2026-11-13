<script lang="ts">
	import { lineSwatchClasses } from '$lib/components/organisations/workflowMap/lineSwatchClasses';
	import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';

	let { colour }: { colour: LineColour } = $props();
</script>

<span class="h-1.5 w-3 shrink-0 rounded-full {lineSwatchClasses[colour]}" aria-hidden="true"></span>
