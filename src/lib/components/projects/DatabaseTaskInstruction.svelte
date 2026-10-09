<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import type { DatabaseTaskInstruction } from '$lib/data/databaseTaskInstruction';

	let { instruction }: { instruction: DatabaseTaskInstruction } = $props();
</script>

<div class="flex flex-col gap-1.5">
	{#if instruction.command !== ''}
		<div class="flex items-center gap-2">
			<code class="min-w-0 flex-1 overflow-x-auto rounded-lg bg-night px-3 py-2 text-xs whitespace-nowrap text-chalk/80">
				{instruction.command}
			</code>
			<CopyTextButton text={instruction.command} label="Copy command" />
		</div>
	{:else}
		<p class="text-xs text-caution">
			The project has no database kind set, so there is nothing to write the command with — edit the project.
		</p>
	{/if}
	{#if instruction.fileAddress !== null}
		<div class="flex items-center gap-2">
			<a
				href={instruction.fileAddress}
				target="_blank"
				rel="noopener"
				class="min-w-0 truncate font-display text-xs text-go hover:brightness-110"
			>
				{instruction.fileAddress} ↗
			</a>
			<CopyTextButton text={instruction.fileAddress} label="Copy link" />
		</div>
	{/if}
</div>
