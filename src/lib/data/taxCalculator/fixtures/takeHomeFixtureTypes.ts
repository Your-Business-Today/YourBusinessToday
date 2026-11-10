import type { Class2Position } from '../class2Position';
import type { SelfAssessmentBill } from '../selfAssessmentBill';
import type { StudentLoanSelection } from '../studentLoans';
import type { SelfEmploymentInputs, TakeHomeInputs } from '../takeHomeInputs';
import type { TaxYearName } from '../taxRuleTypes';

export type FixtureInputs = Omit<TakeHomeInputs, 'taxYear'>;

export type FixtureCaseInputs = Partial<Omit<FixtureInputs, 'selfEmployment' | 'studentLoans'>> & {
	selfEmployment?: Partial<SelfEmploymentInputs>;
	studentLoans?: Partial<StudentLoanSelection>;
};

export type FixtureSelfAssessment = Pick<
	SelfAssessmentBill,
	'incomeTax' | 'class4' | 'studentLoan' | 'cisDeductions' | 'balanceDue' | 'outcome'
>;

export type TakeHomeOutcome = {
	personalAllowance: number;
	taxableIncome: number;
	incomeTax: number;
	class1: number;
	class4: number;
	studentLoans: number[];
	pensionCost: number;
	takeHome: number;
	profit: number | null;
	usesTradingAllowance: boolean | null;
	selfAssessment: FixtureSelfAssessment | null;
	paymentsOnAccount: number | null;
	class2: Class2Position | null;
};

export type TakeHomeFixtureCase = {
	name: string;
	inputs: FixtureCaseInputs;
	working: string[];
	expected: TakeHomeOutcome;
};

export type TakeHomeFixtureFile = {
	taxYear: TaxYearName;
	defaultInputs: FixtureInputs;
	cases: TakeHomeFixtureCase[];
};
