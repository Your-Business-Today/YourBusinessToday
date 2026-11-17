/** How a client's own Claude finds and files a story, attached to file_news_story so describe_action carries it. */
export const newsFilingDoctrine = [
	'Search only public pages: never a page behind a login, a paywall or a social network.',
	'Say where you read each story: the link is the public page you read it on.',
	'Call list_news_watch_list first: a story that matches a watched thing names it with watchedThingId and says why it matched.',
	'A link already in the news is never filed twice: filing it again answers with the story already there.',
	"Keep the headline, the link and your own short note on why it matters to this organisation; never copy the article's text.",
	'Your Business Today summarises nothing and calls no AI model: the note is yours, written by you for the person you work with.'
].join(' ');
