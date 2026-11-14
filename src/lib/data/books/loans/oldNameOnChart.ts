/** A loan account's person before and after a correction, and the name of the chart's account it is kept on. */
export type RenamedPerson = { accountName: string; oldName: string; newName: string };

/** Whether the chart's account still carries the person's old name, which a correction to the loan account never renames. */
export function stillHoldsOldName(person: RenamedPerson): boolean {
	const isRenamed = person.oldName !== person.newName;
	const hasOldName = person.accountName.includes(person.oldName);
	const isOldNamePartOfNewName = person.newName.includes(person.oldName) && person.accountName.includes(person.newName);
	return isRenamed && hasOldName && !isOldNamePartOfNewName;
}
