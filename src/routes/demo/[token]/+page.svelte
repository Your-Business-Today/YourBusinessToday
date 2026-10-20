<script lang="ts">
	import DemoActivitySection from '$lib/components/demo/DemoActivitySection.svelte';
	import DemoBrainSection from '$lib/components/demo/DemoBrainSection.svelte';
	import DemoConnectSection from '$lib/components/demo/DemoConnectSection.svelte';
	import DemoLinkedSystemsSection from '$lib/components/demo/DemoLinkedSystemsSection.svelte';
	import DemoMoneySection from '$lib/components/demo/DemoMoneySection.svelte';
	import DemoOwnSystemSection from '$lib/components/demo/DemoOwnSystemSection.svelte';
	import DemoQuestionsSection from '$lib/components/demo/DemoQuestionsSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const business = $derived(data.business);

	const pageTitle = 'Your demo | Your Business Today';
	const pageDescription =
		'Your private copy of a made-up business. Connect your own Claude with the link on this page and run it.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/demo" />

<DemoConnectSection {business} connectorUrl={data.connectorUrl} demoUrl={data.demoUrl} />
<DemoQuestionsSection />
<DemoMoneySection findings={data.findings} />
<DemoLinkedSystemsSection systems={business.systems} />
<DemoBrainSection notes={business.brain} />
<DemoActivitySection log={business.log} />
<DemoOwnSystemSection />
