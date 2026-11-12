/** An account as the admin page lists it: who, and their standing here. */
export type AccountOnRegister = {
	id: string;
	email: string;
	isAdmin: boolean;
	isStaff: boolean;
	isRestricted: boolean;
	joinedAt: string;
};

export const accountOnRegisterColumns = 'id, email, is_admin, is_staff, is_restricted, created_at';

export function parseAccountOnRegister(row: Record<string, unknown>): AccountOnRegister {
	return {
		id: row.id as string,
		email: row.email as string,
		isAdmin: row.is_admin === true,
		isStaff: row.is_staff === true,
		isRestricted: row.is_restricted === true,
		joinedAt: row.created_at as string
	};
}
