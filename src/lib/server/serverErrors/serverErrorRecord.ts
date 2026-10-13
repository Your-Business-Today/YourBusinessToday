export type ServerErrorRecord = {
	reference: string;
	occurredAt: string;
	routeId: string | null;
	pathname: string;
	method: string;
	userId: string | null;
	status: number;
	message: string;
	causeMessage: string;
	causeStack: string | null;
};

export type ServerErrorRow = {
	reference: string;
	occurred_at: string;
	route_id: string | null;
	pathname: string;
	method: string;
	user_id: string | null;
	status: number;
	message: string;
	cause_message: string;
	cause_stack: string | null;
};

export function toServerErrorRow(record: ServerErrorRecord): ServerErrorRow {
	return {
		reference: record.reference,
		occurred_at: record.occurredAt,
		route_id: record.routeId,
		pathname: record.pathname,
		method: record.method,
		user_id: record.userId,
		status: record.status,
		message: record.message,
		cause_message: record.causeMessage,
		cause_stack: record.causeStack
	};
}

export function fromServerErrorRow(row: ServerErrorRow): ServerErrorRecord {
	return {
		reference: row.reference,
		occurredAt: row.occurred_at,
		routeId: row.route_id,
		pathname: row.pathname,
		method: row.method,
		userId: row.user_id,
		status: row.status,
		message: row.message,
		causeMessage: row.cause_message,
		causeStack: row.cause_stack
	};
}
