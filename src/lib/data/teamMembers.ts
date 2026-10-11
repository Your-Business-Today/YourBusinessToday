export type TeamMember = {
	id: string;
	name: string;
	initials: string;
	role: string;
	biography: string;
};

export const teamMembers: TeamMember[] = [
	{
		id: 'nigel-reilly',
		name: 'Nigel Reilly',
		initials: 'NR',
		role: 'Managing Partner',
		biography:
			'Nigel sets the direction of the practice. A career across several industries has given him the commercial judgement and the connections the firm runs on.'
	},
	{
		id: 'jeremy-ferendinos',
		name: 'Jeremy Ferendinos',
		initials: 'JF',
		role: 'Founding Partner',
		biography:
			'Jeremy looks after the financial and commercial side. He can read a business on paper as well as he can read it on the floor. He brings client relationships of his own.'
	},
	{
		id: 'james-beadle',
		name: 'James Beadle',
		initials: 'JB',
		role: 'Founding Partner',
		biography:
			'James builds the systems. He has done it for large multinational clients and for small and medium businesses. Those are two very different jobs and he is fluent in both.'
	}
];
