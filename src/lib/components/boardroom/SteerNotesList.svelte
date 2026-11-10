<script lang="ts">
	import type { SteerNoteView } from '$lib/data/boardSeatControlViews';

	let { notes }: { notes: SteerNoteView[] } = $props();
</script>

{#if notes.length > 0}
	<div class="flex flex-col gap-2">
		<p class="text-sm font-medium text-chalk">Your notes, the latest first</p>
		<ul class="flex flex-col gap-2">
			{#each notes as note (note.id)}
				<li class="flex flex-col gap-0.5 border-l-2 border-hairline-strong pl-3">
					<p class="text-sm break-words whitespace-pre-wrap text-chalk-muted">{note.words}</p>
					<p class="text-xs text-chalk-subtle">{note.when}</p>
				</li>
			{/each}
		</ul>
	</div>
{/if}
