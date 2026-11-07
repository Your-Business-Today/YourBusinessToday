<script lang="ts">
	import DiscoveryCallButton from '$lib/components/site/DiscoveryCallButton.svelte';
	import LineIcon from '$lib/components/site/LineIcon.svelte';

	let { onreplay }: { onreplay: () => void } = $props();
</script>

<div
	class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-night/80 px-4 pb-12 @2xl:top-auto @2xl:bottom-[9cqw] @2xl:flex-row @2xl:flex-wrap @2xl:bg-transparent @2xl:pb-0"
>
	<DiscoveryCallButton isSolid />
	<button
		type="button"
		class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-chalk/25 px-5 py-3 font-display text-chalk hover:bg-chalk/10"
		onclick={onreplay}
	>
		<LineIcon kind="refresh" class="h-5 w-5" />
		Watch again
	</button>
</div>
