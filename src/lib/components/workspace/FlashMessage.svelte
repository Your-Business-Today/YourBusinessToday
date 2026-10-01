<script lang="ts">
	let { message }: { message: string | undefined } = $props();
</script>

{#if message !== undefined && message !== ''}
	<p class="rounded-xl border border-go/50 bg-go/10 px-4 py-3 text-sm text-go">{message}</p>
{/if}
