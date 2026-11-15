/** A kind of business a salesperson looks for, by the plain name they would use and the Companies House SIC codes behind it. */
export type BusinessType = { key: string; name: string; sicCodes: string[] };

export const businessTypes: BusinessType[] = [
	{ key: 'builders', name: 'Builders and construction firms', sicCodes: ['41100', '41201', '41202', '42110', '42990', '43110', '43120', '43999'] },
	{ key: 'electricians', name: 'Electricians', sicCodes: ['43210'] },
	{ key: 'plumbers', name: 'Plumbing, heating and air conditioning', sicCodes: ['43220'] },
	{ key: 'building-trades', name: 'Other building trades (roofing, joinery, plastering, decorating)', sicCodes: ['43290', '43310', '43320', '43330', '43341', '43342', '43390', '43910', '43991'] },
	{ key: 'architects', name: 'Architects, surveyors and engineers', sicCodes: ['71111', '71112', '71121', '71122', '71129'] },
	{ key: 'estate-agents', name: 'Estate agents and property managers', sicCodes: ['68310', '68320'] },
	{ key: 'property', name: 'Property investment and letting', sicCodes: ['68100', '68201', '68202', '68209'] },
	{ key: 'accountants', name: 'Accountants and bookkeepers', sicCodes: ['69201', '69202', '69203'] },
	{ key: 'solicitors', name: 'Solicitors and legal services', sicCodes: ['69101', '69102', '69109'] },
	{ key: 'consultants', name: 'Business consultants', sicCodes: ['70221', '70229'] },
	{ key: 'it', name: 'IT and software companies', sicCodes: ['62011', '62012', '62020', '62030', '62090', '63110'] },
	{ key: 'marketing', name: 'Marketing, advertising and PR', sicCodes: ['70210', '73110', '73120', '73200'] },
	{ key: 'design', name: 'Design and photography', sicCodes: ['74100', '74201', '74202', '74203', '74209'] },
	{ key: 'recruitment', name: 'Recruitment agencies', sicCodes: ['78100', '78109', '78200', '78300'] },
	{ key: 'cleaning', name: 'Cleaning, facilities and gardening', sicCodes: ['81100', '81210', '81221', '81222', '81229', '81291', '81299', '81300'] },
	{ key: 'hospitality', name: 'Restaurants, cafés and pubs', sicCodes: ['56101', '56102', '56103', '56210', '56290', '56301', '56302'] },
	{ key: 'shops', name: 'Shops', sicCodes: ['47110', '47190', '47410', '47520', '47599', '47710', '47721', '47750', '47782', '47789', '47910', '47990'] },
	{ key: 'hair-beauty', name: 'Hair and beauty', sicCodes: ['96020', '96040'] },
	{ key: 'health-care', name: 'Health and care (dentists, clinics, care homes)', sicCodes: ['86101', '86102', '86210', '86220', '86230', '86900', '87100', '87300', '88100'] },
	{ key: 'motor', name: 'Car sales and garages', sicCodes: ['45111', '45112', '45200', '45320'] },
	{ key: 'transport', name: 'Transport, couriers and removals', sicCodes: ['49410', '49420', '52290', '53202'] },
	{ key: 'education', name: 'Training and tutoring', sicCodes: ['85310', '85320', '85510', '85590', '85600'] },
	{ key: 'fitness', name: 'Gyms, sport and leisure', sicCodes: ['93110', '93120', '93130', '93199', '93290'] },
	{ key: 'wholesale', name: 'Wholesale and distribution', sicCodes: ['46190', '46390', '46690', '46900'] }
];

const typeByKey = new Map(businessTypes.map((type) => [type.key, type]));

/** The types a search names, in the list's order, leaving out any key the list does not hold. */
export function readBusinessTypes(keys: string[]): BusinessType[] {
	return businessTypes.filter((type) => keys.includes(type.key));
}

export function isBusinessTypeKey(key: string): boolean {
	return typeByKey.has(key);
}

/** Every SIC code the chosen types cover, each once. */
export function sicCodesOfTypes(types: BusinessType[]): string[] {
	return [...new Set(types.flatMap((type) => type.sicCodes))];
}

/** The plain name of the first type a company's SIC codes fall under, or nothing when none do. */
export function businessTypeNameOf(sicCodes: string[]): string {
	const match = businessTypes.find((type) => type.sicCodes.some((code) => sicCodes.includes(code)));
	return match?.name ?? '';
}

/** What the picker says while closed: any business, the one type chosen, or how many are. */
export function describeChosenTypes(keys: string[]): string {
	const chosen = readBusinessTypes(keys);
	if (chosen.length === 0) return 'Any type of business';
	if (chosen.length === 1) return chosen[0].name;
	return `${chosen.length} types chosen`;
}
