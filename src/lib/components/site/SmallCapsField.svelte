<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children, class: extraClasses = '' }: { label: string; children: Snippet; class?: string } =
		$props();
</script>

<label class={`flex flex-col gap-1 ${extraClasses}`}>
	<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">{label}</span>
	{@render children()}
</label>
