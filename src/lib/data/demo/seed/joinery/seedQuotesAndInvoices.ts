import { DemoInvoiceStatus, DemoQuoteStatus, type DemoInvoice, type DemoQuote } from '../../demoBusiness';
import { invoiceIssuedBefore, quoteSentBefore } from '../datedRecords';
import { DemoClientId, DemoJobId } from './seedClientsAndJobs';

const { oakwell, hotel, school, cafe, architects } = DemoClientId;

export function seedQuotes(today: string): DemoQuote[] {
	const { sent, accepted, declined } = DemoQuoteStatus;
	const quote = quoteSentBefore(today);
	return [
		quote('QUO-0318', architects, 'Boardroom panelling, Queen Square offices', 17_800, 34, sent, null),
		quote('QUO-0324', oakwell, 'Plot 6 fitted wardrobes, Oakwell Rise', 6_400, 9, sent, null),
		quote('QUO-0311', school, 'Hall storage cupboards', 5_200, 52, sent, null),
		quote('QUO-0302', hotel, 'Suite wardrobes, phase two', 31_000, 70, accepted, 50),
		quote('QUO-0309', cafe, 'Outdoor bench seating', 1_900, 40, declined, 26)
	];
}

export function seedInvoices(today: string): DemoInvoice[] {
	const { unpaid, paid } = DemoInvoiceStatus;
	const invoice = invoiceIssuedBefore(today);
	return [
		invoice('INV-1041', hotel, DemoJobId.hotelBar, 23_100, 62, unpaid),
		invoice('INV-1047', oakwell, DemoJobId.plotFourKitchen, 18_000, 40, unpaid),
		invoice('INV-1052', hotel, DemoJobId.hotelBar, 23_100, 20, unpaid),
		invoice('INV-1036', school, DemoJobId.schoolLibrary, 8_500, 75, paid),
		invoice('INV-1049', cafe, DemoJobId.cafeCounter, 9_600, 31, paid)
	];
}
