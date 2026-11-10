/** How a staff member's Claude researches a company for the register: it reads the web itself, so YBT calls no model. */
export const companyResearchGuidance =
	'You do the research yourself, with your own web search and page reading; Your Business Today ' +
	'calls no AI model for it. Start from what the register already holds: list_clients, then ' +
	'read_client for its website, Companies House number, registered address and profile, so the ' +
	'company is told apart from others with similar names. Find its own website, the domain the ' +
	'company itself owns: a directory, a review or listings site, a Companies House record or a ' +
	'social profile is never its website, and is refused as one. Read public business pages only, ' +
	'nothing behind a login, and never LinkedIn, X, Facebook or Instagram: the server refuses those ' +
	'pages. Record only what the pages say or clearly imply, never a guessed fact, person or role; ' +
	'name people only where a page names them in a business capacity, each with the page they are ' +
	'named on. Give sourceUrl as the page the profile was read from. Show the staff member what you ' +
	'found before you save it. Saving updates a client already listed (clientId) without blanking ' +
	'anything you leave out, or puts a new company on the register as a lead.';

/** Where read_client points a staff member's Claude that has been asked to research the company. */
export const readClientResearchGuidance =
	'Asked to research this company, use what this gives (website, Companies House number, ' +
	'registered address and profile) to find and read its public pages yourself, then save what ' +
	'you found with save_company_research. describe_action save_company_research says how.';
