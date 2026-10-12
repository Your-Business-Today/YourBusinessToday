import { coverageStateLabels } from '$lib/data/sectorCoverage';
import { formatBritishDate } from '$lib/data/britishDate';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PatchBrief } from '$lib/server/observations/readPatchBrief';

export function describeBrief(patch: Patch, brief: PatchBrief): string {
	const sectors = brief.sectorsToWork.map((entry) => `${entry.sector} — ${coverageStateLabels[entry.state]}`);
	const companies = brief.companies.map((company) => {
		const observed = company.lastObservedAt === null ? 'never observed' : `last observed ${formatBritishDate(company.lastObservedAt)}`;
		return `${company.name} — ${company.companyNumber} — ${company.sector} — ${observed} — ${company.sourceUrl}`;
	});
	const next = brief.nextCursor === null ? 'That is the last page this week.' : `Next page: cursor ${brief.nextCursor}.`;
	return [
		`${patch.name}: sectors most in need of a visit`,
		sectors.length === 0 ? 'Every sector is searched.' : sectors.join('\n'),
		'',
		'Companies to look at this week:',
		companies.length === 0 ? 'None: load the register for this patch first.' : companies.join('\n'),
		'',
		next
	].join('\n');
}
