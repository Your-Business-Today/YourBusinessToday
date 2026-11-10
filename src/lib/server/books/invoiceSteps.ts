/** The invoice a step of the database is to move, as the step is given it. */
export function invoiceTarget(organisationId: string, invoiceId: string) {
	return { target_organisation_id: organisationId, target_invoice_id: invoiceId };
}

/** A move of an invoice in words, and where to read how the invoice stands when it cannot be told whether it happened. */
export function invoiceMoveWords(invoiceKnownAs: string, moved: string) {
	return { move: `invoice ${invoiceKnownAs} was ${moved}`, whereItStands: `read_invoice says where invoice ${invoiceKnownAs} stands` };
}
