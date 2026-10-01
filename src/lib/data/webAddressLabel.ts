const protocolAndTrailingSlash = /^https?:\/\/|\/+$/g;

export function webAddressLabel(webAddress: string): string {
	return webAddress.replace(protocolAndTrailingSlash, '');
}
