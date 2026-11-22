<script lang="ts">
	import { chatFilePath } from '$lib/data/chat/chatPaths';
	import { isPictureShownInRoom } from '$lib/data/chat/chatFilesShared';
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import type { ChatMessageFile } from '$lib/data/chat/chatFileRules';

	let { organisationId, files }: { organisationId: string; files: ChatMessageFile[] } = $props();

	const pictures = $derived(files.filter((file) => isPictureShownInRoom(file.contentType)));
	const otherFiles = $derived(files.filter((file) => !isPictureShownInRoom(file.contentType)));
</script>

{#if pictures.length > 0}
	<ul class="flex flex-wrap gap-2" aria-label="Photos">
		{#each pictures as picture (picture.id)}
			<li>
				<a href={chatFilePath(organisationId, picture.id)} target="_blank" rel="noopener" title={`Open ${picture.fileName} full size`}>
					<img src={chatFilePath(organisationId, picture.id)} alt={picture.fileName} loading="lazy" class="max-h-64 max-w-full object-contain sm:max-w-sm" />
				</a>
			</li>
		{/each}
	</ul>
{/if}
{#if otherFiles.length > 0}
	<ul class="flex flex-col gap-1" aria-label="Files">
		{#each otherFiles as file (file.id)}
			<li class="text-sm">
				<a href={chatFilePath(organisationId, file.id)} class="font-display text-chalk-muted underline-offset-2 hover:text-go hover:underline">{file.fileName}</a>
				<span class="text-chalk-faint">· {describeByteCount(file.sizeBytes)}</span>
			</li>
		{/each}
	</ul>
{/if}
