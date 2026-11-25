<script lang="ts">
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import { documentDownloadHref } from './documentAddress';
	import { fileKindWord } from './documentKinds';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { document, versions }: { document: KeptDocument; versions: DocumentVersion[] } = $props();

	const kindOf = (version: DocumentVersion) => (version.isWritten ? 'Written' : fileKindWord(version.mimeType));
</script>

<ul class="flex flex-col divide-y divide-hairline">
	{#each versions as version (version.id)}
		<li class="flex flex-wrap items-center justify-between gap-3 py-3">
			<div class="flex flex-col gap-0.5">
				<span class="font-display text-chalk">
					Version {version.versionNumber}{version.versionNumber === document.versionNumber ? ' · now' : ''}
				</span>
				<span class="text-xs text-chalk-subtle">{formatUkDateTime(version.recordedAt)} · {kindOf(version)} · {describeByteCount(version.byteCount)}</span>
			</div>
			<a href={documentDownloadHref(document, undefined, version.versionNumber)} data-sveltekit-reload class={panelButtonClasses}>Download</a>
		</li>
	{/each}
</ul>
