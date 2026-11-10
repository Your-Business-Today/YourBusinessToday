<script lang="ts">
	import ChatbotQuestionEntry from '$lib/components/businessBrain/ChatbotQuestionEntry.svelte';
	import ChatbotQuestionsFilterForm from '$lib/components/businessBrain/ChatbotQuestionsFilterForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { businessBrainPageCrumbs } from '$lib/components/businessBrain/businessBrainCrumbs';
	import { chatbotTrailNotKeptYet } from '$lib/data/businessBrainChatbotTrailWording';
	import { isChatbotTrailNarrowed } from '$lib/data/businessBrainChatbotTrailQuery';
	import { panelEmptyClasses, panelListClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { questionsListedSentence } from '$lib/components/businessBrain/businessBrainSentences';

	let { data } = $props();

	const { organisation, chatbot, asked, downloadHref, trail, refusal } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const questions = $derived(trail?.questions ?? []);
	const questionCount = $derived(trail?.questionCount ?? null);
	const isCut = $derived(questionCount !== null && questionCount > questions.length);
	const noQuestionMessage = $derived(
		isChatbotTrailNarrowed(asked) ? 'No question asked through this chatbot matches.' : 'Nobody has asked this chatbot anything yet.'
	);
</script>

<svelte:head>
	<title>Questions asked of {chatbot.name} — Your Business Brain — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={businessBrainPageCrumbs(organisation)} title={`Questions asked of ${chatbot.name}`}>
	<p class="text-sm text-chalk-muted">
		Every question asked through this chatbot, newest first: who asked, what was read for it and the answer their Claude reported.
		Only managers see this record, and nothing on it can be changed.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Questions asked" count={questionCount} errorMessage={refusal ?? ''}>
		{#snippet toolbar()}
			<ChatbotQuestionsFilterForm {asked} people={chatbot.people} clearHref={addresses.chatbotQuestions(chatbot.chatbotId)} {downloadHref} />
		{/snippet}
		{#if refusal !== null}
			<p class={panelEmptyClasses}>Change the search to see the questions asked.</p>
		{:else if trail === null}
			<p class={panelEmptyClasses}>{chatbotTrailNotKeptYet}</p>
		{:else if questions.length === 0}
			<p class={panelEmptyClasses}>{noQuestionMessage}</p>
		{:else}
			{#if isCut}
				<p class="border-b border-hairline px-6 py-3 text-sm text-chalk-muted">{questionsListedSentence(questions.length, trail.questionCount)}</p>
			{/if}
			<ul class={panelListClasses}>
				{#each questions as question (question.questionId)}
					<ChatbotQuestionEntry {question} {addresses} />
				{/each}
			</ul>
		{/if}
	</DashboardPanel>
</div>
