import { isWebAddress } from './webAddress';
import { personResearchLimits } from './personResearchRules';
import { trimmedText } from './trimmedText';

/** A link kept on a person's record: a short label and the page it opens. */
export type PersonLinkFields = { label: string; url: string };

const { longestLinkLabel, longestSourceUrl } = personResearchLimits;

export const personLinkRefusals = {
	label: `The label is 1 to ${longestLinkLabel} characters, such as "Company site".`,
	url: `The url is a full web address starting http:// or https://, at most ${longestSourceUrl} characters.`
} as const;

/** The link as given, checked against the columns it is written to, or a sentence naming what does not fit. */
export function validatePersonLink(input: Record<string, unknown>): PersonLinkFields | string {
	const label = trimmedText(input.label);
	if (label === '' || label.length > longestLinkLabel) return personLinkRefusals.label;
	const url = trimmedText(input.url);
	if (url.length > longestSourceUrl || !isWebAddress(url)) return personLinkRefusals.url;
	return { label, url };
}
