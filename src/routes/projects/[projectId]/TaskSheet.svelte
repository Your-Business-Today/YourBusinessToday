<script lang="ts">
	import BrandSpinner from '$lib/components/site/BrandSpinner.svelte';
	import Sheet from '$lib/components/site/Sheet.svelte';
	import TaskPage from './tasks/[taskId]/+page.svelte';
	import { goto, preloadData } from '$app/navigation';
	import { page } from '$app/state';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import type { PageData as TaskPageData } from './tasks/[taskId]/$types';

	const firstErrorStatus = 400;

	let taskData = $state<TaskPageData | null>(null);
	let loadedHref: string | null = null;
	let latestLoad = {};

	const target = $derived(taskSheet.target);
	const href = $derived(target === null ? null : taskPagePath(target));

	$effect(() => {
		taskSheet.follow(page.state, location.pathname);
	});

	/** The task is fetched when the sheet opens, and again whenever the board reloads, since a form posted from the sheet reloads both. */
	$effect(() => {
		void page.data;
		if (href === null) return;
		loadTask(href);
	});

	async function loadTask(taskHref: string) {
		const thisLoad = (latestLoad = {});
		if (loadedHref !== taskHref) taskData = null;
		const result = await preloadData(taskHref);
		if (thisLoad !== latestLoad) return;
		const isShowable = result.type === 'loaded' && result.status < firstErrorStatus;
		if (!isShowable) {
			await goto(taskHref);
			return;
		}
		taskData = result.data as TaskPageData;
		loadedHref = taskHref;
	}
</script>

{#if target !== null && href !== null}
	<Sheet label="Task" fullPageHref={href} onClose={() => taskSheet.close()}>
		{#if taskData === null}
			<div class="flex flex-1 items-center justify-center">
				<BrandSpinner />
			</div>
		{:else}
			<TaskPage data={taskData} form={page.form} />
		{/if}
	</Sheet>
{/if}
