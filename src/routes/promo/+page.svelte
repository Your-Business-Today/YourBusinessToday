<script lang="ts">
	import { page } from '$app/state';
	import PromoIntro from '$lib/components/promo/PromoIntro.svelte';
	import PromoPlayer from '$lib/components/promo/PromoPlayer.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const filmingParameter = 'render';
	const pageTitle = 'Your Business Today in 3D | Watch how we build your business app';
	const pageDescription =
		'A short film of how Your Business Today maps the way your business works, builds your app and AI assistant in the open, and has it live in weeks.';
	const { url } = page;
	const isFilming = url.searchParams.has(filmingParameter);
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/promo" />

<section class="mx-auto w-full max-w-6xl px-0 py-0 md:px-6 md:py-10">
	<PromoPlayer {isFilming} />
	<PromoIntro />
</section>
