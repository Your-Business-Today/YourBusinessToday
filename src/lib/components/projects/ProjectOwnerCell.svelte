<script lang="ts">
	import { ownerCellClasses } from './projectTableStyles';
	import { ownerLabel } from '$lib/data/projectOwnerLabel';

	let { project }: { project: { isYours: boolean; ownerName: string } } = $props();

	const owner = $derived(ownerLabel(project));
</script>

<span class={ownerCellClasses} title={owner}>{owner}</span>
