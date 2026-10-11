<script lang="ts">
	import BrandWordmark from './BrandWordmark.svelte';
	import { companyDetails } from '$lib/data/companyDetails';
</script>

<footer class="border-t border-hairline bg-night print:hidden">
	<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-3">
				<BrandWordmark fontSize={18} />
				<p class="text-sm text-chalk/60">
					Your Business Today. We use AI to streamline your business.
				</p>
			</div>
			<a
				href={`mailto:${companyDetails.consultingEmail}`}
				class="text-sm text-chalk/60 transition hover:text-chalk"
			>
				{companyDetails.consultingEmail}
			</a>
		</div>
		<div class="flex flex-wrap items-center gap-6">
			<a href="/vision" class="text-sm text-chalk/60 transition hover:text-chalk">
				What we build
			</a>
			<a href="/offer" class="text-sm text-chalk/60 transition hover:text-chalk">The offer</a>
			<a href="/case-studies/jewel" class="text-sm text-chalk/60 transition hover:text-chalk">
				Case study
			</a>
			<a href="/contact" class="text-sm text-chalk/60 transition hover:text-chalk">Contact</a>
			<a href="/terms" class="text-sm text-chalk/60 transition hover:text-chalk">
				Terms of service
			</a>
			<a href="/privacy" class="text-sm text-chalk/60 transition hover:text-chalk">
				Privacy statement
			</a>
			<a href="/company" class="text-sm text-chalk/60 transition hover:text-chalk">
				Company information
			</a>
		</div>
		<p class="w-full text-xs text-chalk/40">
			{companyDetails.legalName} · Registered in {companyDetails.registeredIn}, company number
			{companyDetails.registrationNumber} · Registered office: {companyDetails.registeredAddress}
		</p>
	</div>
</footer>
