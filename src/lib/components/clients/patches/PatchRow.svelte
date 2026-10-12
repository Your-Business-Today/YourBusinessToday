<script lang="ts">
	import type { PatchWithCentre } from '$lib/server/patches/listPatchesWithCentres';

	let { patch }: { patch: PatchWithCentre } = $props();

	const reach = $derived(`${patch.centrePostcode} · ${patch.radiusMiles} mile${patch.radiusMiles === 1 ? '' : 's'}`);
</script>

<li class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
	<div class="flex flex-col gap-1">
		<a href={`/clients/patches/${patch.id}`} class="font-display text-lg hover:text-signal">{patch.name}</a>
		<p class="text-sm text-chalk/60">{reach} · {patch.outcodes.join(' ')}</p>
	</div>
	<p class="text-sm text-chalk/60">{patch.ownerName}</p>
</li>
