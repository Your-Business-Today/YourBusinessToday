import type { YbtCommand } from './ybtCommand';

/** The command that readies a staff member's Claude for a meeting with a lead and files what they relay while it runs. */
export const meetingCommand: YbtCommand = {
	name: 'ybt-meeting',
	title: 'YBT meeting: ready me for a meeting with a lead',
	description:
		'Ready your Claude for a meeting with the lead you name: a one-screen brief of their domain, workflow map, products, people in the loop and quote, then everything you relay filed as you say it, and the meeting logged on the lead at the end.',
	text:
		'We are in a meeting with a lead: the company I name after the command. Ready yourself first, then file what I tell you while the meeting runs. ' +
		'Find the company with list_clients and read it with read_client; when it has no organisation yet, open_lead_organisation gives it one and invites nobody. ' +
		'Read where things stand: read_business_brain_domain for what we believe about the business and the questions it leaves open, ' +
		'read_workflow_map for the Before and the After, read_map_products for the products we recommend, ' +
		'read_people_in_the_loop for where their people stay in the loop, and read_lead_quote for the plan and its fees. ' +
		'Give me a brief that fits one screen: what we believe, what we assumed and want to ask, the products, where people stay in the loop, and the quote. ' +
		'During the meeting, what I tell you is what the lead said, and my telling you is my yes: file it as said, at once, and answer in one line saying what you filed and nothing more. ' +
		'A fact about the business revises the domain page that holds it and drops the assumption it settles, with file_business_brain_domain, naming this meeting as the source. ' +
		'A step, a role or a hand-over changes the map with amend_workflow_map; a product agreed or dropped is a change to the planned stations of the After. ' +
		'A stage or a price is a new version of the quote with file_lead_quote, every line carried forward, its figures only from me or the rates sheet, never from you. ' +
		'Nothing is sent to the lead, and no email address or phone number goes into the map. ' +
		'At the end, log the meeting on the lead with log_lead_conversation, a summary and the deal points with nothing personal, and list for me what is still open.'
};
