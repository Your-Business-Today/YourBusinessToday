import { clientStageLabels } from '$lib/data/clientLifecycle';
import { describeFiledFigures } from '$lib/data/filedFigures';
import { formatBritishDate } from '$lib/data/britishDate';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';
import type { StandingByCompanyNumber } from '$lib/server/clients/area/findRegisterStanding';

export const noSuchRegisterCompany = 'No company with that number is in the register for this patch.';

export const longestRegisterAnswer = 200;

export function describeRegisterCompanies(companies: LocatedRegisterCompany[], standings: StandingByCompanyNumber): string {
	if (companies.length === 0) return 'No register company matches in this patch.';
	const shown = companies.slice(0, longestRegisterAnswer);
	const lines = shown.map((company) => describeRegisterLine(company, standings.get(company.companyNumber)?.stage ?? null));
	if (companies.length > shown.length) {
		lines.push(`… and ${companies.length - shown.length} more — narrow by sicCode, status or incorporatedSince.`);
	}
	return lines.join('\n');
}

function describeRegisterLine(company: LocatedRegisterCompany, stage: keyof typeof clientStageLabels | null): string {
	const { sicCodes } = company;
	return [
		`${company.name} — ${company.companyNumber}`,
		`${company.postcode} (${company.sector})`,
		company.statusNote === '' ? company.companyStatus : `${company.companyStatus} — ${company.statusNote}`,
		company.incorporatedOn === '' ? 'incorporation unknown' : `incorporated ${formatBritishDate(company.incorporatedOn)}`,
		sicCodes.length === 0 ? 'no SIC code' : `SIC ${sicCodes.join(' ')}`,
		company.figures === null ? 'no figures read yet' : describeFiledFigures(company.figures),
		stage === null ? 'not on our register' : clientStageLabels[stage]
	].join(' — ');
}
