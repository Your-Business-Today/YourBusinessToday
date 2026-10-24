export type CaseStudyFigure = {
	label: string;
	value: string;
};

export type CaseStudy = {
	id: string;
	href: string;
	clientName: string;
	clientDescription: string;
	problem: string;
	idea: string;
	outcome: string;
	figures: CaseStudyFigure[];
};

/** The construction company is never named: its portal is its own and so is its name. */
export const constructionCompanyCaseStudy: CaseStudy = {
	id: 'construction-company',
	href: '/case-studies/construction-company',
	clientName: 'A family run construction company',
	clientDescription:
		'Loft conversions, extensions and whole house renovations across the South of England, with sixty five years of trade experience in the family.',
	problem:
		'The building was never the problem. It was everything around it. The day on site arrived in the office as messages and photographs. Somebody then had to turn them into a report for the client. Drawings came back marked up. Valuations were put together by hand. The person who knew where everything was could never take a Friday off.',
	idea:
		'We spent a week on paper with the people who do the work. Then we spent a week proving the idea in code. The idea fits in one sentence. Everything arriving at the business is a communication and a person makes one decision about it. After that the system groups them and the machine writes what has to be written.',
	outcome:
		'The company now runs on a portal that shows every project at the stage it is really at. A plain English request becomes a build they can watch. Their own AI assistant can read a job or raise a request without opening the site.',
	figures: [
		{ value: '1,032', label: 'commits' },
		{ value: '79', label: 'build days' },
		{ value: '41', label: 'pull requests' },
		{ value: '85', label: 'connector tools' }
	]
};
