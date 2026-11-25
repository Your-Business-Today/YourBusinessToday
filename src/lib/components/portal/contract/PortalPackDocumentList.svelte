<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { portalContractDocumentPath } from '$lib/portal/portalPaths';
	import type { ContractPackDocument } from '$lib/data/contractPack';

	let { documents }: { documents: ContractPackDocument[] } = $props();

	function standingOf({ signature }: ContractPackDocument): string {
		if (signature === null) return 'To read and sign';
		return `Signed by ${signature.signerName} on ${formatBritishDate(signature.signedOn)}`;
	}
</script>

<ol class="flex flex-col gap-3">
	{#each documents as document (document.documentId)}
		<li class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
			<a href={portalContractDocumentPath(document.documentId)} class="text-chalk underline hover:text-signal">{document.title}</a>
			<span class="text-chalk-subtle">{standingOf(document)}</span>
		</li>
	{/each}
</ol>
