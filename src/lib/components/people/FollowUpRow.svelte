<script lang="ts">
	import { companyPagePath } from '$lib/data/salesRegisters';
	import { describeDueDay, isOverdue } from '$lib/data/followUpSentences';
	import type { FollowUp } from '$lib/server/people/getFollowUpsDue';

	let { followUp, today }: { followUp: FollowUp; today: string } = $props();

	const due = $derived(describeDueDay(followUp.nextActionDue, today));
	const dueClasses = $derived(`first-letter:uppercase ${isOverdue(followUp.nextActionDue, today) ? 'text-signal' : ''}`);
</script>

<li class="flex min-w-0 flex-col gap-1 px-4 py-3">
	<p class="font-display text-sm leading-snug">
		<a href={`/people/${followUp.id}`} class="transition hover:text-go">{followUp.name}</a><span class="text-chalk/70">: {followUp.nextAction}</span>
	</p>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-chalk/60">
		<span class={dueClasses}>{due}</span>
		{#each followUp.companies as company (company.id)}
			<a href={companyPagePath(company)} class="transition hover:text-go">{company.name}</a>
		{/each}
	</div>
</li>
