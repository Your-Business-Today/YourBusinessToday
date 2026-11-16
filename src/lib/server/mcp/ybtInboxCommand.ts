import type { YbtCommand } from './ybtCommand';

export const consultingMailbox = 'consulting@yourbusiness.today';

/** The command that works the consulting Gmail inbox the way the Jewel portals' triage queue is worked, with YBT keeping each decision. */
export const inboxCommand: YbtCommand = {
	name: 'ybt-inbox',
	title: 'YBT inbox: triage my inbox with Your Business Today',
	description:
		'Go through the new emails in the consulting Gmail inbox one by one: file each under its client or lead, raise what it asks for, or set it aside, with every decision kept so no run decides an email twice.',
	text:
		`Triage my inbox with Your Business Today. This needs the Gmail connector on in Claude, signed in as ${consultingMailbox}: ` +
		'if you have no Gmail tools, say so in one sentence and stop. ' +
		`First run read_inbox_triage for ${consultingMailbox}, then search Gmail as it says and skip every message id it lists. ` +
		'Take the emails one at a time, oldest first. For each, run find_records_for_email with its from, to and cc. ' +
		'File it under the client or lead it is about with file_email_to_client; raise what it sets off, a lead, a task, a support request or a to-do, ' +
		'with the action list_actions offers for it; or set it aside when it is spam, a newsletter, an automatic reply or a receipt. ' +
		'In Gmail put the labels YBT/<client name> and YBT/Triaged on it, and archive it out of the inbox only when nothing is left to do on it. ' +
		'Then record_triage_decision with its outcome; record several at once when you can. ' +
		'Ask me only about an email whose client or lead is not clear, one at a time. Never send or draft a reply during triage. ' +
		'End with one short summary: what was filed where, what was raised, and what needs me.'
};
