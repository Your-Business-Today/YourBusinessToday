import { filedEmailDirectionLabels, gmailThreadLink, type FiledEmail } from '$lib/data/filedEmailRules';

const noneFiled = 'None filed yet. File each one about this client with file_email_to_client.';
const noSubject = '(no subject)';

/** The emails filed under a client, the latest sent first, each with the link that opens its thread in Gmail. */
export function describeFiledEmails(emails: FiledEmail[]): string[] {
	if (emails.length === 0) return [noneFiled];
	return emails.flatMap(filedEmailLines);
}

function filedEmailLines(email: FiledEmail): string[] {
	const how = filedEmailDirectionLabels[email.direction];
	const withWhom = email.personName === '' ? '' : ` (${email.personName})`;
	const subject = email.subject === '' ? noSubject : `"${email.subject}"`;
	const heading = `- ${email.sentAt}, ${how}, from ${email.from}${withWhom}: ${subject} — filed email ${email.id}`;
	return [heading, `    ${email.summary}`, `    Open in Gmail: ${gmailThreadLink(email)}`];
}
