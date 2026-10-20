<script lang="ts">
	import DemoOwnSystemSection from '$lib/components/demo/DemoOwnSystemSection.svelte';
	import DemoPromisesSection from '$lib/components/demo/DemoPromisesSection.svelte';
	import DemoStartSection from '$lib/components/demo/DemoStartSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const pageTitle = 'Try it with your own Claude | Your Business Today';
	const pageDescription =
		'Connect your own Claude to a made-up business and run it: ask where the money is leaking, chase the invoices, teach it how you work. A private copy for you, on dummy data.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/demo" />

<DemoStartSection message={form?.message ?? null} />
<DemoPromisesSection />
<DemoOwnSystemSection />
