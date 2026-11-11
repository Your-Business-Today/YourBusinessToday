<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { internalProjectLabel, internalProjectMeaning } from '$lib/data/internalProject';
</script>

<span title={`Internal: ${internalProjectMeaning}`} class="inline-flex">
	<Badge label={internalProjectLabel} />
</span>
