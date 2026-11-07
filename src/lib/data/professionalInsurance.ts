export type ProfessionalInsurance = {
	insurer: string;
	cover: string;
	territorialScope: string;
};

export const professionalInsurance: ProfessionalInsurance | null = {
	insurer: 'Hiscox Insurance Company Limited, 22 Bishopsgate, London EC2N 4BQ',
	cover: '£2,000,000 in the aggregate, including all costs',
	territorialScope: 'worldwide, excluding claims brought in the USA or Canada'
};
