# The weekly patch sweep

The prompt a staff member gives a weekly scheduled task in their own Claude, word for word. It
runs on their claude.ai subscription with the Your Business Today connector attached; nothing
runs on YBT's own API key. A Claude Cowork scheduled task is the right kind: it runs in the cloud
with the account's connectors. On a Team plan an Owner adds the connector first.

> Call `get_current_context`, then `list_patches`, and take the patch I work (ask me once if there
> is more than one, then remember it). Call `read_patch_brief` for it, with the cursor from last
> week's run if there was one.
>
> For each sector the brief names as most in need of a visit, say so to me in one line; do not
> search it now.
>
> For each company the brief lists, search the open web for anything notable in the last seven
> days: a news item, a public post on the company's own site or a video channel, a vacancy
> advertised on a public job page, a new or changed website, a planning notice, an office move.
> A social signal here is what a public page shows without a login; LinkedIn, X, Facebook and
> Instagram are not read, and the connector refuses a page from them. For each thing you find,
> call `record_patch_observation` with the company number, the kind, one line on what you saw and
> the page you saw it on. Business-contact data only; nothing about a person's private life.
>
> Stop at the end of the brief's page. Tell me how many observations you recorded, name the
> three most notable in one line each, and give me the cursor for next week.

The brief caps each run at a page of companies, oldest-observed first, so a run stays inside a
subscription's limits; the next page is taken the following week with the cursor the brief
gives. What the task records shows on `/clients/feed` and on the company's own page under
*Observed on the web*.
