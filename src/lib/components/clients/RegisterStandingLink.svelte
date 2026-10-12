<script lang="ts">
	import StagePill from '$lib/components/clients/StagePill.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { RegisterStanding } from '$lib/server/clients/area/areaPin';

	let { standing }: { standing: RegisterStanding } = $props();
</script>

<div class="flex flex-wrap items-center gap-3">
	<StagePill stage={standing.stage} />
	<a href={`/clients/${standing.clientId}`} class={quietButtonClasses}>Open the client</a>
</div>
