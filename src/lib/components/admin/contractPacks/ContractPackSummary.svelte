<script lang="ts">
	import { contractPackStageWords } from '$lib/data/contractPackRules';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import { documentsHrefOf, documentOwnerKinds } from '$lib/projectDocuments/documentOwner';
	import PackCommentList from '$lib/components/portal/contract/PackCommentList.svelte';
	import { bracketedBlanks, type ContractPack } from '$lib/data/contractPack';

	let { pack, organisationId }: { pack: ContractPack; organisationId: string } = $props();

	const documentsHref = $derived(documentsHrefOf({ kind: documentOwnerKinds.organisation, id: organisationId }));
	const stage = $derived(contractPackStageWords[pack.stage]);
	const preparedAt = $derived(formatUkDateTime(pack.preparedAt));
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-lg text-chalk">Latest pack — {stage}</h2>
	<p class="text-sm text-chalk/60">Prepared {preparedAt}. Each document is kept on the organisation, where a change to this client's copy is kept as a new version.</p>
	<ol class="flex flex-col gap-2">
		{#each pack.documents as document (document.documentId)}
			{@const openBlanks = document.openBlanks}
			{@const signature = document.signature}
			<li class="text-sm text-chalk/80">
				<a href={`${documentsHref}/${document.documentId}`} class="underline hover:text-chalk">{document.title}</a>
				<span class="text-chalk/50">, version {document.versionNumber}</span>
				{#if signature !== null}
					<span class="text-chalk/50"> — signed by {signature.signerName}</span>
				{/if}
				{#if openBlanks.length > 0}
					<span class="text-signal"> — still open: {bracketedBlanks(openBlanks)}</span>
				{/if}
			</li>
		{/each}
	</ol>
	<PackCommentList comments={pack.comments} />
</section>
