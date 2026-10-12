import { areaEventSentence } from '$lib/data/areaEvent';
import { clientStageLabels } from '$lib/data/clientLifecycle';
import { formatBritishDate, formatBritishDateTime } from '$lib/data/britishDate';
import { observationKindLabels } from '$lib/data/observationRules';
import { standingLine } from '$lib/data/standingLine';
import { describeFilingLine } from './describeFilings';
import type { PatchCompanyReading } from '$lib/server/patches/readCompanyInPatch';

/** One company, everything known, in the order a person would read it: who it is, where we stand, what was seen, what happened. */
export function describePatchCompany(reading: PatchCompanyReading): string {
	const { company, standing, sightings, premisesBeside, observations, events, filings } = reading;
	const { sicCodes } = company;
	return [
		`${company.name} — ${company.companyNumber} — ${company.companyStatus}${company.statusNote === '' ? '' : ` — ${company.statusNote}`}`,
		`${company.registeredAddress} (${company.sector})`,
		company.incorporatedOn === '' ? 'Incorporation unknown' : `Incorporated ${formatBritishDate(company.incorporatedOn)}`,
		sicCodes.length === 0 ? 'No SIC code' : `SIC ${sicCodes.join(', ')}`,
		standingLine(company) || 'Nothing filed or flagged is known yet',
		standing === null ? 'Not on our register' : `On our register: ${clientStageLabels[standing.stage]} (client ${standing.clientId})`,
		'',
		`Sightings: ${sightings.length === 0 ? 'none' : sightings.map((sighting) => `${sighting.address || sighting.sector} — ${sighting.whatWasSeen} (${sighting.sourceUrl})`).join('; ')}`,
		`Premises beside where it was sighted: ${premisesBeside.length === 0 ? 'none' : premisesBeside.map((one) => one.businessName).join(', ')}`,
		`Observed: ${observations.length === 0 ? 'nothing yet' : observations.map((one) => `${formatBritishDate(one.observedAt)} ${observationKindLabels[one.kind]}: ${one.headline}`).join('; ')}`,
		'',
		`Filings stored: ${filings.length === 0 ? 'none yet; read_company_filings reads them live' : filings.slice(0, 10).map(describeFilingLine).join('; ')}`,
		'',
		'In the feed:',
		events.length === 0 ? 'Nothing yet.' : events.map((event) => `${formatBritishDateTime(event.createdAt)}: ${areaEventSentence(event)}`).join('\n')
	].join('\n');
}
