<script lang="ts">
	import Button from './Button.svelte';

	let { title, onClose }: { title: string; onClose: () => void } = $props();
</script>

<div class="flex items-center justify-between gap-4 border-b border-hairline pb-4">
	<h2 class="font-display text-2xl font-semibold text-chalk">{title}</h2>
	<Button look="ghost" isIconOnly label="Close" onclick={onClose}>
		<span class="text-2xl leading-none text-chalk" aria-hidden="true">✕</span>
	</Button>
</div>
