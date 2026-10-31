<script lang="ts">
	import { fade } from 'svelte/transition';
	import BrandSpinner from './BrandSpinner.svelte';
	import { SlowNavigation } from '$lib/client/slowNavigation.svelte';

	const slowNavigation = new SlowNavigation();
	const fadeDuration = 150;
</script>

{#if slowNavigation.isActive}
	<div
		transition:fade={{ duration: fadeDuration }}
		class="fixed inset-0 z-30 flex items-center justify-center bg-night/60 backdrop-blur-[2px]"
	>
		<BrandSpinner />
	</div>
{/if}
