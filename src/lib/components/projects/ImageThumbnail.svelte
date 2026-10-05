<script lang="ts">
	let { src, alt, sizeClasses }: { src: string; alt: string; sizeClasses: string } = $props();

	let isLoaded = $state(false);
</script>

<span class={`relative block shrink-0 ${sizeClasses}`}>
	{#if !isLoaded}
		<span aria-hidden="true" class="absolute inset-0 animate-pulse rounded-lg bg-chalk/10"></span>
	{/if}
	<img
		{src}
		{alt}
		loading="lazy"
		onload={() => (isLoaded = true)}
		onerror={() => (isLoaded = true)}
		class={`rounded-lg border border-hairline object-cover transition-opacity duration-300 ${sizeClasses}`}
		class:opacity-0={!isLoaded}
	/>
</span>
