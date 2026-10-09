const britishLocale = 'en-GB';

export function formatBritishDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString(britishLocale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

export function formatBritishDateTime(isoDate: string): string {
	return new Date(isoDate).toLocaleString(britishLocale, {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatBritishTime(isoDate: string): string {
	return new Date(isoDate).toLocaleTimeString(britishLocale, { hour: '2-digit', minute: '2-digit' });
}
