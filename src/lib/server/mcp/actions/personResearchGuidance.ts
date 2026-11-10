const publicBusinessPresenceOnly =
	"Find the person's public business presence only: their companies' websites, press coverage, " +
	'trade directories, awards, talks, projects and public bios. Read public pages only, nothing behind ' +
	'a login, and never LinkedIn, X, Facebook or Instagram: the server refuses those pages. Never record ' +
	'their private life, family, health or politics, or anything outside their business capacity, and ' +
	'never guess. Use what the register holds (their companies, officer id and links) to tell them apart ' +
	'from namesakes, and leave out any page you cannot be sure is about the same person.';

/** How a staff member's Claude reads a person before researching them: it reads the web itself, so YBT calls no model. */
export const readPersonGuidance =
	'Asked to research this person, you do the research yourself, with your own web search and page ' +
	'reading; Your Business Today calls no AI model for it. ' +
	publicBusinessPresenceOnly +
	' Then save what you found with save_person_research. describe_action save_person_research says how.';

/** How a staff member's Claude saves what it found about a person. */
export const savePersonResearchGuidance =
	'Read the person first with read_person. ' +
	publicBusinessPresenceOnly +
	' Write the summary in plain British English: who they are in business, what they are known for and ' +
	'what they seem to be building. Give each role with the page it was read on, the pages worth keeping ' +
	'on their record as links with a short label such as "Company site" or "Interview, 2025", and every ' +
	'page you read as sources. Show the staff member what you found before you save it. Saving adds the ' +
	'summary as a "Found on the web" note, adds each link the person does not have yet, and records the ' +
	'research on each of their companies; nothing already held is changed or removed.';
