<script lang="ts">
	import { raiseAnywayFieldName, raiseAnywayFormValue, type SimilarTask } from '$lib/data/similarTasks';

	let { similarTasks, onCancel }: { similarTasks: SimilarTask[]; onCancel: () => void } = $props();
</script>

<section class="flex flex-col gap-3" aria-label="Similar open tasks">
	<ul class="flex flex-col gap-2 text-sm">
		{#each similarTasks as similarTask (similarTask.taskId)}
			<li>
				<a
					href={`/projects/${similarTask.projectId}/tasks/${similarTask.taskId}`}
					target="_blank"
					rel="noopener"
					class="text-chalk underline-offset-2 hover:underline"
				>
					{similarTask.title}
				</a>
				<span class="text-chalk/60">on {similarTask.projectName}, raised by {similarTask.raisedBy}</span>
			</li>
		{/each}
	</ul>
	<div class="flex justify-end gap-2">
		<button type="button" onclick={onCancel} class="px-4 py-2 text-sm text-chalk/70 hover:text-chalk">
			Cancel
		</button>
		<button
			type="submit"
			name={raiseAnywayFieldName}
			value={raiseAnywayFormValue}
			class="rounded-full bg-caution px-5 py-2 text-sm font-medium text-night transition hover:brightness-110"
		>
			Raise anyway
		</button>
	</div>
</section>
