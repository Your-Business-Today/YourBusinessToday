export function downloadTextFile(fileName: string, contents: string, mediaType: string): void {
	const fileUrl = URL.createObjectURL(new Blob([contents], { type: mediaType }));
	const link = Object.assign(document.createElement('a'), { href: fileUrl, download: fileName });
	link.click();
	URL.revokeObjectURL(fileUrl);
}
