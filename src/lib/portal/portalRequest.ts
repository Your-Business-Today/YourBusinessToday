/** One message on a request's conversation, as the client who raised it reads it. */
export type PortalRequestMessage = {
	id: string;
	body: string;
	createdAt: string;
	authorName: string;
	isFromVisitor: boolean;
};

/** A request a client contact raised on the portal, with its state and its conversation. */
export type PortalRequest = {
	id: string;
	title: string;
	details: string;
	statusLabel: string;
	isDone: boolean;
	resolution: string;
	createdAt: string;
	messages: PortalRequestMessage[];
};

/** The longest each value a client types may be: the form shows them, and the site refuses anything longer. */
export const portalRequestLimits = {
	titleLength: 200,
	wantLength: 4000,
	benefitLength: 1000,
	replyLength: 4000
} as const;
