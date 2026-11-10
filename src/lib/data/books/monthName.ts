const anyLeapYear = 2000;

const monthNames = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' });

/** The month's name in English, from its number: 1 is January and 12 is December. */
export function monthName(month: number): string {
	return monthNames.format(new Date(Date.UTC(anyLeapYear, month - 1, 1)));
}
