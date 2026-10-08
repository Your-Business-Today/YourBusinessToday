import { createHmac, timingSafeEqual } from 'node:crypto';

/** A link whose holder may add files to one task, as one person, until it expires. */
export type TaskUploadLink = { taskId: string; grantedTo: string; expiresAt: string };

export const uploadPageLifetimeMinutes = 30;

/** Where the page behind a link lives on the site, ahead of the link's token. */
export const uploadPagePath = '/upload';

const millisecondsPerSecond = 1000;
const millisecondsPerMinute = 60 * millisecondsPerSecond;
const uuidByteCount = 16;
const expiryByteCount = 4;
const packedLinkByteCount = uuidByteCount + uuidByteCount + expiryByteCount;
const signatureByteCount = 16;
const signingPurpose = 'task-upload-link';
const tokenEncoding = 'base64url';
const uuidGroups = /^(.{8})(.{4})(.{4})(.{4})(.{12})$/;

export function taskUploadLinkFor(taskId: string, grantedTo: string, now: Date): TaskUploadLink {
	const expiry = now.getTime() + uploadPageLifetimeMinutes * millisecondsPerMinute;
	return { taskId, grantedTo, expiresAt: new Date(expiry).toISOString() };
}

/** When the link was made, which is where the count of what it has let through begins. */
export function taskUploadLinkStart(link: TaskUploadLink): string {
	const expiry = new Date(link.expiresAt).getTime();
	return new Date(expiry - uploadPageLifetimeMinutes * millisecondsPerMinute).toISOString();
}

/** The link as a token: what it says, then a signature only this site can make. */
export function signTaskUploadLink(link: TaskUploadLink, signingKey: string): string {
	const packedLink = packLink(link);
	const signature = signatureOf(packedLink, signingKey);
	return `${packedLink.toString(tokenEncoding)}.${signature.toString(tokenEncoding)}`;
}

/** The link a token carries — null when it was not signed here, or its time has passed. */
export function readTaskUploadLink(
	token: string,
	signingKey: string,
	now: Date
): TaskUploadLink | null {
	const [linkPart = '', signaturePart = '', ...surplusParts] = token.split('.');
	const packedLink = Buffer.from(linkPart, tokenEncoding);
	const signature = Buffer.from(signaturePart, tokenEncoding);
	if (surplusParts.length > 0 || packedLink.length !== packedLinkByteCount) return null;
	if (!isSignedHere(packedLink, signature, signingKey)) return null;
	const link = unpackLink(packedLink);
	const hasExpired = Date.parse(link.expiresAt) < now.getTime();
	if (hasExpired) return null;
	return link;
}

function isSignedHere(packedLink: Buffer, signature: Buffer, signingKey: string): boolean {
	if (signature.length !== signatureByteCount) return false;
	return timingSafeEqual(signature, signatureOf(packedLink, signingKey));
}

function signatureOf(packedLink: Buffer, signingKey: string): Buffer {
	const signer = createHmac('sha256', signingKey).update(signingPurpose).update(packedLink);
	return signer.digest().subarray(0, signatureByteCount);
}

function packLink(link: TaskUploadLink): Buffer {
	const expiry = Buffer.alloc(expiryByteCount);
	expiry.writeUInt32BE(Math.floor(new Date(link.expiresAt).getTime() / millisecondsPerSecond));
	return Buffer.concat([uuidBytes(link.taskId), uuidBytes(link.grantedTo), expiry]);
}

function unpackLink(packedLink: Buffer): TaskUploadLink {
	const expirySeconds = packedLink.readUInt32BE(uuidByteCount + uuidByteCount);
	return {
		taskId: uuidFrom(packedLink.subarray(0, uuidByteCount)),
		grantedTo: uuidFrom(packedLink.subarray(uuidByteCount, uuidByteCount + uuidByteCount)),
		expiresAt: new Date(expirySeconds * millisecondsPerSecond).toISOString()
	};
}

function uuidBytes(uuid: string): Buffer {
	return Buffer.from(uuid.replaceAll('-', ''), 'hex');
}

function uuidFrom(bytes: Buffer): string {
	return bytes.toString('hex').replace(uuidGroups, '$1-$2-$3-$4-$5');
}
