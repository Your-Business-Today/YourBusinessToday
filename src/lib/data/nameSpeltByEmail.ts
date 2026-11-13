const mailboxSeparator = '@';
const wordSeparator = /[^\p{L}]+/u;
const wordSpacing = ' ';

/** The name an address spells before its @, a word to each run of letters, each capitalised; the address itself when it spells no word. */
export function nameSpeltByEmail(email: string): string {
	const [mailbox] = email.split(mailboxSeparator);
	const words = mailbox.split(wordSeparator).filter((word) => word !== '');
	if (words.length === 0) return email;
	return words.map(capitalised).join(wordSpacing);
}

function capitalised(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
