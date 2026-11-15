<script lang="ts">
	import { isWebAddress } from '$lib/data/webAddress';

	let { address }: { address: string } = $props();

	const canBeFollowed = $derived(isWebAddress(address));
</script>

{#if canBeFollowed}
	<a href={address} target="_blank" rel="noreferrer" class="break-all hover:text-signal">{address}</a>
{:else}
	<span class="break-all">{address}</span>
{/if}
