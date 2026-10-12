<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';

	let { message, clientId }: { message: string | null; clientId: string | undefined } = $props();
</script>

<FormErrorNote {message} />
{#if clientId !== undefined}
	<p class="text-sm text-chalk/70">
		<a href={`/clients/${clientId}`} class="text-go hover:underline">Open the client</a>
	</p>
{/if}
