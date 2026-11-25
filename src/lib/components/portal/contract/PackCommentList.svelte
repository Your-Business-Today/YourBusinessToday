<script lang="ts">
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import type { ContractPackComment } from '$lib/data/contractPack';

	let { comments }: { comments: ContractPackComment[] } = $props();
</script>

{#if comments.length > 0}
	<ul class="flex flex-col gap-2">
		{#each comments as comment (comment.madeAt)}
			<li class="text-sm text-chalk/80">
				<span class="text-chalk-subtle">{formatBritishDateTime(comment.madeAt)}{comment.clause === '' ? '' : `, clause ${comment.clause}`}:</span>
				{comment.comment}
			</li>
		{/each}
	</ul>
{/if}
