<script lang="ts">
	import { sentFileStatuses, type SentFile } from './uploadPageFiles.svelte';

	let { sentFiles }: { sentFiles: SentFile[] } = $props();

	const statusLabels = {
		[sentFileStatuses.sending]: 'Sending…',
		[sentFileStatuses.onTheTask]: 'On the task',
		[sentFileStatuses.failed]: 'Not sent'
	};

	const statusClasses = {
		[sentFileStatuses.sending]: 'text-chalk/50',
		[sentFileStatuses.onTheTask]: 'text-go',
		[sentFileStatuses.failed]: 'text-caution'
	};
</script>

{#if sentFiles.length > 0}
	<ul class="flex flex-col gap-2" aria-live="polite">
		{#each sentFiles as sentFile, index (index)}
			<li class="flex flex-wrap justify-between gap-x-4 gap-y-1 rounded-xl border border-hairline px-4 py-3">
				<span class="min-w-0 truncate font-display text-chalk">{sentFile.name}</span>
				<span class={`text-sm ${statusClasses[sentFile.status]}`}>{statusLabels[sentFile.status]}</span>
				{#if sentFile.problem !== null}
					<p class="basis-full text-sm text-caution">{sentFile.problem}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
