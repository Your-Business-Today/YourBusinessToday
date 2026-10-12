<script lang="ts">
	import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';

	let { company }: { company: LocatedRegisterCompany } = $props();
</script>

<li class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
	<a href={company.sourceUrl} target="_blank" rel="noreferrer" class="text-chalk/90 hover:text-signal">{company.name}</a>
	<span class="text-xs text-chalk/50">{company.companyNumber} · {company.postcode} · {company.companyStatus}</span>
</li>
