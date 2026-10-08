<script lang="ts">
	import SentFileList from '$lib/components/upload/SentFileList.svelte';
	import TaskUploadZone from '$lib/components/upload/TaskUploadZone.svelte';
	import { UploadPageFiles } from '$lib/components/upload/uploadPageFiles.svelte';

	let { data } = $props();

	const pageFiles = new UploadPageFiles();
</script>

<svelte:head>
	<title>Add files to a task — Your Business Today</title>
	<meta name="robots" content="noindex" />
	<meta name="referrer" content="no-referrer" />
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
	{#if data.taskTitle === null}
		<div class="flex flex-col gap-2">
			<h1 class="font-display text-3xl font-medium">This link has stopped working</h1>
			<p class="text-chalk/70">
				An upload link takes files for {data.linkLifetimeMinutes} minutes. Ask Claude for a fresh
				one, and it will open this page again.
			</p>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			<h1 class="font-display text-3xl font-medium">Add files to the task</h1>
			<p class="text-chalk/70">{data.taskTitle}</p>
		</div>
		<TaskUploadZone onFilesGiven={(files) => pageFiles.send(files)} />
		<SentFileList sentFiles={pageFiles.sentFiles} />
	{/if}
</div>
