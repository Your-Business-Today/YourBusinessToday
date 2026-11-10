/** What an organisation's books print on its invoices, how its year runs and how its invoices are numbered. */
export type BooksSettings = {
	companyName: string;
	companyAddress: string;
	companyEmail: string;
	paymentInstructions: string;
	bankAccountName: string;
	bankAccountNumber: string;
	bankSortCode: string;
	paymentTermsDays: number;
	financialYearStartMonth: number;
	invoicePrefix: string;
	nextInvoiceNumber: number;
};

export type BooksSetting = keyof BooksSettings;

/** The settings a person asked to change; every one left out keeps what the books hold. */
export type BooksSettingsChange = Partial<BooksSettings>;

export const booksSettingsTable = 'books_settings';

/** Each setting's column in books_settings (migration 0151), stated once for reading and writing. */
export const booksSettingsColumns: Record<BooksSetting, string> = {
	companyName: 'company_name',
	companyAddress: 'company_address',
	companyEmail: 'company_email',
	paymentInstructions: 'payment_instructions',
	bankAccountName: 'bank_account_name',
	bankAccountNumber: 'bank_account_number',
	bankSortCode: 'bank_sort_code',
	paymentTermsDays: 'payment_terms_days',
	financialYearStartMonth: 'financial_year_start_month',
	invoicePrefix: 'invoice_prefix',
	nextInvoiceNumber: 'next_invoice_number'
};

export const booksSettingNames = Object.keys(booksSettingsColumns) as BooksSetting[];

/** What an organisation's invoices take until its settings are saved: the column defaults of books_settings (migration 0151). */
export const invoiceSettingDefaults = { invoicePrefix: 'INV', nextInvoiceNumber: 1, paymentTermsDays: 30 } as const;
