<script lang="ts">
	import NewsletterSignUpForm from './NewsletterSignUpForm.svelte';
	import { newsletterPromise, newsletterSignUpLabel } from '$lib/data/newsletterSignUp';
</script>

<section class="flex w-full flex-col gap-3 md:w-auto md:max-w-sm">
	<h2 class="font-display text-base font-medium text-chalk">{newsletterSignUpLabel}</h2>
	<p class="text-sm text-chalk/60">{newsletterPromise}</p>
	<NewsletterSignUpForm />
</section>
