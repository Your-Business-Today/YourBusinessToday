export function observeVisibility(element: HTMLElement, onChange: (isVisible: boolean) => void): () => void {
	const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting));
	observer.observe(element);
	return () => observer.disconnect();
}
