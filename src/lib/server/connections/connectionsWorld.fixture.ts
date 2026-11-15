/** A director on an officers list, born in the month and year given, with an appointments link to their own id. */
export function officerItem(officerId: string, registerName: string, role: string, birth: { month: number; year: number }): Record<string, unknown> {
	return { name: registerName, officer_role: role, date_of_birth: birth, links: { officer: { appointments: `/officers/${officerId}/appointments` } } };
}

export function appointmentItem(companyNumber: string, companyName: string, role = 'director'): Record<string, unknown> {
	return { officer_role: role, appointed_to: { company_number: companyNumber, company_name: companyName, company_status: 'active' } };
}

export function personControlItem(forename: string, surname: string, birth: { month: number; year: number }): Record<string, unknown> {
	return {
		kind: 'individual-person-with-significant-control',
		name: `Mr ${forename} ${surname}`,
		name_elements: { forename, surname },
		date_of_birth: birth,
		natures_of_control: ['ownership-of-shares-50-to-75-percent']
	};
}

export function companyControlItem(companyNumber: string, name: string): Record<string, unknown> {
	return { kind: 'corporate-entity-person-with-significant-control', name, identification: { registration_number: companyNumber }, natures_of_control: ['ownership-of-shares-75-to-100-percent'] };
}

export type ConnectionsWorld = {
	officers: Record<string, Record<string, unknown>[]>;
	appointments: Record<string, { items: Record<string, unknown>[]; activeCount?: number }>;
	control: Record<string, Record<string, unknown>[]>;
};

/** A stand-in for the officers, appointments and significant-control calls, answering from the world given. */
export function companiesHouseOver(world: ConnectionsWorld) {
	return async (address: URL | string) => {
		const [, first, key, last] = new URL(String(address)).pathname.split('/');
		const isOfficers = first === 'company' && last === 'officers';
		if (isOfficers) return Response.json({ items: world.officers[key] ?? [] });
		const isControl = first === 'company' && last === 'persons-with-significant-control';
		if (isControl) return controlAnswer(world.control[key]);
		const { items, activeCount } = world.appointments[key] ?? { items: [] };
		return Response.json({ items, active_count: activeCount ?? items.length });
	};
}

const notFound = 404;

function controlAnswer(items: Record<string, unknown>[] | undefined): Response {
	if (items === undefined) return new Response('{}', { status: notFound });
	return Response.json({ items });
}
