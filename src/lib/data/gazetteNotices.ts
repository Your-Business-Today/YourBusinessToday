import { areaEventKinds, type AreaEventKind } from './areaEventKind';

/** The corporate insolvency notices the feed carries, by The Gazette's own notice code, with the words in the title that also name them. */
export type GazetteNoticeKind = Extract<AreaEventKind, 'winding_up_petitioned' | 'administration_opened' | 'liquidator_appointed'>;

export const gazetteNoticeCodes: Record<string, GazetteNoticeKind> = {
	'2410': areaEventKinds.windingUpPetitioned,
	'2450': areaEventKinds.administrationOpened,
	'2434': areaEventKinds.liquidatorAppointed
};

const titleWords: [string, GazetteNoticeKind][] = [
	['petitions to wind up', areaEventKinds.windingUpPetitioned],
	['appointment of administrators', areaEventKinds.administrationOpened],
	['appointment of liquidators', areaEventKinds.liquidatorAppointed]
];

export const gazetteNoticeStatusNotes: Record<GazetteNoticeKind, string> = {
	winding_up_petitioned: 'Winding-up petition',
	administration_opened: 'In administration',
	liquidator_appointed: 'Liquidator appointed'
};

export const gazetteNoticeDetails: Record<GazetteNoticeKind, (companyName: string) => string> = {
	winding_up_petitioned: (companyName) => `a winding-up petition against ${companyName}`,
	administration_opened: (companyName) => `the appointment of administrators over ${companyName}`,
	liquidator_appointed: (companyName) => `the appointment of a liquidator over ${companyName}`
};

/** The kind a notice is, from its code first and its title second, or null when it is a notice the feed does not carry. */
export function gazetteNoticeKindOf(noticeCode: string, title: string): GazetteNoticeKind | null {
	const byCode = gazetteNoticeCodes[noticeCode] ?? null;
	if (byCode !== null) return byCode;
	const lowered = title.toLowerCase();
	return titleWords.find(([words]) => lowered.includes(words))?.[1] ?? null;
}
