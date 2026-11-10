/** The fields the deadlines email form sends, and the limits the form shows and the server enforces. */
export const deadlinesEmailFields = {
	email: 'email',
	taxYear: 'taxYear',
	takeHome: 'takeHome',
	selfAssessmentBill: 'selfAssessmentBill',
	paymentOnAccount: 'paymentOnAccount',
	honeypot: 'nickname'
} as const;

export const deadlinesEmailLimits = {
	longestEmail: 254,
	largestAmount: 100_000_000
};

export type EstimateFigureName = 'takeHome' | 'selfAssessmentBill' | 'paymentOnAccount';

export type EstimateFigures = {
	takeHome: number;
	selfAssessmentBill: number | null;
	paymentOnAccount: number | null;
};

export const estimateFigureLabels: Record<EstimateFigureName, string> = {
	takeHome: 'Take-home for the year',
	selfAssessmentBill: 'Self Assessment bill',
	paymentOnAccount: 'Each payment on account'
};
