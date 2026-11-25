<script lang="ts">
	import { formatUkDateTime } from '$lib/data/britishDate';
	import type { ShownInputRequest } from '$lib/projectDocuments/documentInputRequest';

	let { inputRequests }: { inputRequests: ShownInputRequest[] } = $props();
</script>

{#if inputRequests.length === 0}
	<p class="text-sm text-chalk-muted">Nobody has been asked for their input yet. Ask your Claude to ask someone on the team.</p>
{:else}
	<ul class="flex flex-col divide-y divide-hairline">
		{#each inputRequests as request (request.id)}
			<li class="flex flex-col gap-1 py-3">
				<span class="text-xs text-chalk-subtle">{request.askedByName} asked {request.askedOfName} · {formatUkDateTime(request.createdAt)}</span>
				<p class="text-sm text-chalk">{request.question}</p>
				{#if request.answer === null}
					<p class="text-sm text-chalk-muted">Waiting on {request.askedOfName}.</p>
				{:else}
					<p class="border-l-4 border-go pl-3 text-sm text-chalk">{request.answer}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
