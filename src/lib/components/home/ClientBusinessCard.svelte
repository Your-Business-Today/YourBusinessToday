<script lang="ts">
	import type { ClientBusiness } from '$lib/data/clientBusinesses';

	let { business }: { business: ClientBusiness } = $props();
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage/60 p-6">
	<h3 class="font-display text-xl font-medium">{business.kind}</h3>
	<p class="text-chalk/70">{business.whatRunsOnIt}</p>
</div>
