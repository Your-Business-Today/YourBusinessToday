import {
	campaignPagePath,
	describeCostPerClick,
	formatCount,
	formatPence,
	formatShare,
	objectiveLabelOf
} from '$lib/brand/campaigns/campaignReportWords';
import { portalAddress } from '$lib/portal/portalAddress';
import { countOf } from '$lib/data/countOf';
import type { AudienceRowsSorted } from '$lib/brand/audience/sortAudienceRows';
import type { AudienceShare } from '$lib/brand/audience/audienceBreakdown';
import type { CampaignReport } from '$lib/brand/campaigns/campaignReport';

const noBreakdown = 'Who it reached: no breakdown has been recorded yet; record_campaign_audience records one.';

/** One campaign's report as read_campaign_report gives it, with the address of the page that prints it. */
export function describeCampaignReport(report: CampaignReport, organisationId: string): string {
	const { campaign, figures } = report;
	const pageAddress = `${portalAddress.origin}${campaignPagePath(organisationId, campaign.id)}`;
	return [
		`${campaign.name} [${campaign.status}]: paid for “${objectiveLabelOf(campaign.objective)}”, ${campaign.startsOn} to ${campaign.endsOn}`,
		`- Budget ${formatPence(campaign.budgetPence)}, spent ${formatPence(figures.spendPence)}`,
		`- ${formatCount(figures.impressions)} impressions, ${formatCount(figures.reach)} people reached`,
		`- ${formatCount(figures.clicks)} clicks; a click cost ${describeCostPerClick(report.costPerClickPence)}`,
		...describeAudience(report),
		`The page, which prints on one page: ${pageAddress}`
	].join('\n');
}

/** What record_campaign_audience says it kept, and each band it refused by name. */
export function describeAudienceRecording({ kept, refusals }: AudienceRowsSorted, observedOn: string): string {
	const keptLine = kept.length === 0 ? 'No band was recorded.' : `Recorded ${countOf(kept.length, 'band')} of the audience on ${observedOn}.`;
	if (refusals.length === 0) return keptLine;
	const refusedLine = `Refused ${countOf(refusals.length, 'band')}, and nothing was kept for those:`;
	return [keptLine, refusedLine, ...refusals.map((refusal) => `- ${refusal}`)].join('\n');
}

function describeAudience(report: CampaignReport): string[] {
	if (report.audienceObservedOn === null) return [noBreakdown];
	return [
		`Who it reached, as the platform gave it on ${report.audienceObservedOn}:`,
		`- By age: ${report.byAgeBand.map(describeShare).join('; ')}`,
		`- By gender: ${report.byGender.map(describeShare).join('; ')}`
	];
}

function describeShare(share: AudienceShare): string {
	return `${share.label} ${formatCount(share.reach)} (${formatShare(share.shareOfReach)}), ${countOf(share.clicks, 'click')}`;
}
