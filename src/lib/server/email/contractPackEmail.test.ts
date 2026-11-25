import { describe, expect, it } from 'vitest';
import { contractPackEmailSubject, renderContractPackEmail } from './contractPackEmail';

describe('the email that sends a client their contract pack', () => {
	it('names the client, lists each document and carries one link to the pack', () => {
		const html = renderContractPackEmail({ contactName: 'Sam', clientName: 'Harbour <Dental>', documentTitles: ['Order Form'], packUrl: 'https://portal.example/portal/contract' });
		expect(html).toContain('Harbour &lt;Dental&gt;');
		expect(html).toContain('<li>Order Form</li>');
		expect(html).toContain('href="https://portal.example/portal/contract"');
		expect(contractPackEmailSubject('Harbour Dental')).toContain('Harbour Dental');
	});
});
