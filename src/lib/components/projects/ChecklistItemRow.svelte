<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ChecklistItem } from '$lib/server/projects/checklistRecord';

	let { item }: { item: ChecklistItem } = $props();

	const tracker = new FormTracker();
</script>

<li class="flex items-center gap-3 px-4 py-2.5" class:animate-pulse={tracker.isSaving}>
	<form method="POST" action="?/setChecklistItemDone" use:enhance={tracker.submit()}>
		<input type="hidden" name="itemId" value={item.id} />
		<input type="hidden" name="isDone" value={item.isDone ? 'false' : 'true'} />
		<button
			type="submit"
			disabled={tracker.isSaving}
			aria-label={item.isDone ? 'Mark as not done' : 'Mark as done'}
			class={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition
				${item.isDone ? 'border-go bg-go/20 text-go' : 'border-hairline text-chalk/40 hover:border-go'}`}
		>
			{item.isDone ? '✓' : ''}
		</button>
	</form>
	<p class={`flex-1 text-sm ${item.isDone ? 'text-chalk/50 line-through' : 'text-chalk/90'}`}>
		{item.description}
	</p>
	<form method="POST" action="?/deleteChecklistItem" use:enhance={tracker.submit()}>
		<input type="hidden" name="itemId" value={item.id} />
		<button
			type="submit"
			disabled={tracker.isSaving}
			aria-label="Delete item"
			class="px-1 text-chalk/40 transition hover:text-signal"
		>
			✕
		</button>
	</form>
</li>
