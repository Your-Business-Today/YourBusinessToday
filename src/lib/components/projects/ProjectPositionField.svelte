<script lang="ts">
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import { shownIdsField } from '$lib/data/shownIds';

	let { position, shownIds }: { position: number; shownIds: string } = $props();
</script>

<input type="hidden" name={shownIdsField} value={shownIds} />
<PriorityField priority={position} among="of your board" />
