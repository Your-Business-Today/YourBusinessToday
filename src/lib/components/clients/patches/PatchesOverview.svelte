<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createPatchesOverview, type PatchesOverviewHandle } from './createPatchesOverview';
	import { describeNearQuery } from '$lib/data/nearPoint';
	import type { PatchWithCentre } from '$lib/server/patches/listPatchesWithCentres';

	let { patches }: { patches: PatchWithCentre[] } = $props();

	let container: HTMLDivElement;
	let handle = $state<PatchesOverviewHandle | null>(null);

	const events = {
		onOpen: (patchId: string) => goto(`/clients/patches/${patchId}`),
		onPick: (point: { latitude: number; longitude: number }) => goto(`?${describeNearQuery(point)}#new-patch`)
	};

	onMount(() => {
		let isUnmounted = false;
		createPatchesOverview(container, events).then((created) => {
			if (isUnmounted) return created.destroy();
			handle = created;
		});
		return () => {
			isUnmounted = true;
			handle?.destroy();
		};
	});

	$effect(() => {
		handle?.showPatches(patches);
	});
</script>

<div class="flex flex-col gap-2">
	<div
		bind:this={container}
		class="h-[28rem] w-full overflow-hidden rounded-2xl border border-hairline bg-carriage lg:h-[34rem]"
		aria-label="Map of Great Britain with every patch"
	></div>
	<p class="text-xs text-chalk/50">A circle opens its patch. Click anywhere else to start a new patch there.</p>
</div>
