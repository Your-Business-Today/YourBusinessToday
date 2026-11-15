<script lang="ts">
	import PutBackTaskModal from './PutBackTaskModal.svelte';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import type { DeletedTask } from '$lib/server/projects/readDeletedTasks';

	let { deletedTask }: { deletedTask: DeletedTask } = $props();

	let isPutBackOpen = $state(false);

	const deleted = $derived(`Deleted ${formatUkDateTime(deletedTask.deletedAt)} by ${deletedTask.deletedByName}`);
	const under = $derived(deletedTask.parentTitle === null ? '' : ` · under ${deletedTask.parentTitle}`);
	const putBackAt = $derived(deletedTask.putBackAt);

	function openPutBack() {
		isPutBackOpen = true;
	}
</script>

<li class="flex min-w-0 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex min-w-0 flex-col gap-1">
		<p class="line-clamp-2 font-display text-sm leading-snug">{deletedTask.title}</p>
		<p class="text-xs text-chalk/60">{deletedTask.statusLabel}{under} · {deleted}</p>
	</div>
	{#if putBackAt === null}
		<button
			type="button"
			onclick={openPutBack}
			class="shrink-0 self-start rounded-full border border-hairline px-4 py-1.5 font-display text-xs text-chalk/80
				transition hover:border-chalk/40 hover:text-chalk sm:self-auto"
		>
			Put back
		</button>
	{:else}
		<p class="shrink-0 text-xs text-chalk/60">Put back {formatUkDateTime(putBackAt)}</p>
	{/if}
</li>

<PutBackTaskModal {deletedTask} bind:isOpen={isPutBackOpen} />
