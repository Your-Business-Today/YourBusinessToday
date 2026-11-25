import type { PackSendingPlan } from '$lib/server/contractPacks/packSendingPlan';

/** Exactly what send_contract_pack will send, for the person to see and say yes to first. */
export function describePackSending(plan: PackSendingPlan): string {
	const { contact, documents } = plan;
	return [
		`From: ${plan.from}`,
		`To: ${contact.name} <${contact.email}> (contact id: ${contact.id})`,
		`Subject: ${plan.subject}`,
		`One email, with one link to the pack in their client portal: ${plan.packUrl}`,
		'The documents they will read and sign there:',
		...documents.map(({ title, versionNumber }, index) => `${index + 1}. ${title}, version ${versionNumber}`),
		`Nothing has been sent. On the person's yes, send_contract_pack with packId ${plan.packId} and contactId ${contact.id} sends it.`
	].join('\n');
}
