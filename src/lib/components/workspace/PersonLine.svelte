<script lang="ts">
	import PersonInitials from './PersonInitials.svelte';

	let { name, caption = '' }: { name: string; caption?: string } = $props();
</script>

<span class="flex min-w-0 items-center gap-3">
	<PersonInitials {name} />
	<span class="flex min-w-0 flex-col">
		<span class="truncate">{name}</span>
		{#if caption !== ''}
			<span class="truncate text-xs font-normal text-chalk-subtle">{caption}</span>
		{/if}
	</span>
</span>
