/** The invoice email's colours: dark ink on white paper, so the copy a customer prints or forwards reads as the page does. */
const invoicePalette = {
	paper: '#ffffff',
	desk: '#f3f4f7',
	rule: '#dfe2ea',
	ink: '#141927',
	softInk: '#4a5268',
	faintInk: '#7a8299',
	signal: '#ff4d5e'
} as const;

/** Every inline style the invoice email uses, because mail programs draw inline styles and little else. */
export const invoiceEmailStyles = {
	desk: `margin:0;padding:32px 16px;background-color:${invoicePalette.desk};font-family:Arial,Helvetica,sans-serif;`,
	paper: `max-width:640px;margin:0 auto;background-color:${invoicePalette.paper};border:1px solid ${invoicePalette.rule};padding:32px;`,
	seller: `margin:0 0 4px;font-size:20px;font-weight:bold;color:${invoicePalette.ink};`,
	title: `margin:0 0 16px;font-size:24px;font-weight:bold;color:${invoicePalette.ink};`,
	text: `margin:0 0 16px;font-size:15px;line-height:1.6;color:${invoicePalette.softInk};`,
	stamp: `margin:0 0 16px;font-size:15px;font-weight:bold;color:${invoicePalette.signal};`,
	label: `margin:24px 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${invoicePalette.faintInk};`,
	partyName: `margin:0 0 4px;font-size:16px;font-weight:bold;color:${invoicePalette.ink};`,
	detail: `margin:0 0 4px;font-size:14px;line-height:1.5;color:${invoicePalette.softInk};`,
	table: 'width:100%;border-collapse:collapse;margin:24px 0 8px;',
	headCell: `padding:8px 4px;border-bottom:2px solid ${invoicePalette.ink};font-size:12px;text-align:left;color:${invoicePalette.faintInk};`,
	headFigure: `padding:8px 4px;border-bottom:2px solid ${invoicePalette.ink};font-size:12px;text-align:right;color:${invoicePalette.faintInk};`,
	cell: `padding:8px 4px;border-bottom:1px solid ${invoicePalette.rule};font-size:14px;color:${invoicePalette.ink};`,
	figure: `padding:8px 4px;border-bottom:1px solid ${invoicePalette.rule};font-size:14px;text-align:right;color:${invoicePalette.ink};`,
	totalCell: `padding:8px 4px;font-size:15px;font-weight:bold;color:${invoicePalette.ink};`,
	totalFigure: `padding:8px 4px;font-size:15px;font-weight:bold;text-align:right;color:${invoicePalette.ink};`,
	link: `color:${invoicePalette.ink};`,
	smallPrint: `margin:24px 0 0;font-size:12px;line-height:1.6;color:${invoicePalette.faintInk};`
} as const;
