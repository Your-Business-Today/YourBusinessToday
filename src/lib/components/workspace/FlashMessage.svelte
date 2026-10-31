<script lang="ts">
	import { fade } from 'svelte/transition';
	import { backdropFade } from '$lib/client/motion';

	let { message }: { message: string | undefined } = $props();
</script>

{#if message !== undefined && message !== ''}
	<p transition:fade={backdropFade} class="rounded-xl border border-go/50 bg-go/10 px-4 py-3 text-sm text-go">{message}</p>
{/if}
