/** An optional clause as a page shows it: what it is, whether a pack takes it unless told not to, and its text. */
export type OptionalClauseReading = {
	slug: string;
	title: string;
	summary: string;
	isChosenByDefault: boolean;
	clauseHtml: string;
};
