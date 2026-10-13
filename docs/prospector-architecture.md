# The Prospector — Architecture

How YBT finds new clients for a customer: from business profile to a scored, contactable
pipeline they can export to their CRM — or work inside YBT until YBT *is* their CRM.

## The product in one sentence

The Prospector reads what a customer's best clients look like from their business profile,
hunts public sources for businesses that match, scores each candidate with a reason, and
files them into a pipeline the customer can act on.

## Design principles

Same rules as the rest of the platform. Each agent has one job and a name that says what it
does. Agents communicate through one shared artefact — here, the **Ideal Client Profile**
and the **Prospect Directory** — never through each other's internals. Every stage ships
value on its own.

## The shared artefacts

**Ideal Client Profile (ICP)** — typed, versioned, per company:

- `industries` — sectors and SIC codes that fit
- `companyShape` — size band, age band, geography
- `structuralSignals` — needs the public record proves, each one visible and datable
  (a holding company forming, a QS or office role advertised, the shape of the filings,
  premises moving, planning applications, process promises on the company's own website,
  poor reviews of an incumbent supplier)
- `dispositionQuestions` — what only a conversation can tell (would they commission
  bespoke software rather than subscribe to an off-the-shelf product; are they AI-forward
  enough to want to talk to their system through Claude)
- `disqualifiers` — what to skip, learned from rejections

The two signal lists are kept apart because they behave differently. Structural need can
be scored from public sources. Disposition cannot: nothing in Companies House, on a job
board or on a company's website predicted that Jewel's director would want to run his
portal through Claude — that showed only in the first meeting. Putting both on one scale
would mean inventing disposition or silently dropping it.

**Prospect Directory** — the CRM-shaped model:

- `Prospect` — company name, website, source, registry number, `structuralScore`,
  `scoreRationale`, `scoreEvidence` (each signal found, with its source URL and date),
  `openQuestions` (the ICP's disposition questions, for a person to answer on the call),
  `pipelineStage` (sourced → qualified → contacted → replied → won / lost / rejected)
- `ProspectContact` — name, role, publicly listed email/phone, source URL
- `ProspectEvent` — every touch: sourced, scored, exported, outreach drafted, stage moved

## The pipeline, agent by agent

### Stage 1 — the Profiler: profile → ICP

Claude reads the Workflow Map and interview transcripts (which already describe services,
typical clients, and capacity) and emits the ICP as structured output. The customer edits
and approves it — the ICP is a visible, ownable thing, not a hidden prompt. Every batch of
accepted and rejected prospects feeds back into the next ICP version, so targeting sharpens
with use.

### Stage 2 — the Scout: ICP → candidates

Fan out across sources, each behind its own named adapter:

| Source | What it gives | Cost |
| --- | --- | --- |
| Companies House API | Every UK company: SIC codes, location, age, filings, officers | Free |
| Google Places API | Local businesses by category and radius: website, phone, reviews | ~£25/1k lookups |
| Claude web search tool | Directories, news, "just moved premises" signals, niche lists | ~$10/1k searches |
| Customer's own list | Upload competitors' client lists, trade-body member lists | Free |

Companies House is the backbone for UK B2B — filter by SIC code, region, incorporation
date, and account filings (a company that just filed growing accounts is a buying signal in
itself). Places covers the local-services market where the registry is too coarse. Claude's
web search finds what neither structured source can. The Scout looks only for
`structuralSignals`; it never searches for disposition, because no source holds it. Deliberately no LinkedIn scraping —
against its terms and legally fragile; officer names from Companies House plus the
company's own website cover most of what it would give.

### Stage 3 — the Assessor: candidates → scored prospects

For each candidate: fetch the company's public website, then one Claude call reads it
against the ICP and returns structured output — a 0–100 score of structural need only, the
evidence behind it (each signal found, with its source URL and the date it was true), a
one-paragraph rationale written to be shown to the customer, extracted public contact
details with their source URLs, and the open questions. A point of score with no dated
public source behind it is not given. The open questions are the ICP's
`dispositionQuestions`, carried on the prospect for a person to answer on the first call;
the Assessor never guesses them, and the rationale says what the record shows, not whether
the prospect will buy. Answers recorded after the call feed the next ICP version like any
other outcome. Candidates below a floor score are discarded before
they cost a credit. Deduplication runs on registry number and domain before anything is
written.

### Stage 4 — the Directory: prospects → pipeline

Scored prospects land in the Prospect Directory with `pipelineStage = 'sourced'`. From
there:

- **Work it in YBT** — a pipeline view (stages as columns), each card carrying the score,
  rationale, open questions and contacts. Stage moves are `ProspectEvent`s, so history is a ledger like
  everything else. This is the CRM-lite path that grows into YBT-as-CRM.
- **Export it** — CSV shaped to the import formats of HubSpot, Pipedrive, and generic
  column mapping. Exports are events too, so the customer can see what left the building.
- **Draft outreach** — Claude writes a first-contact email per prospect, grounded in the
  rationale and the customer's own services and tone from the profile. Drafts only; the
  customer sends from their own address. Sending on their behalf is a later, consent-heavy
  feature.

## Why this is hard to copy

Generic lead tools start from a form ("pick an industry"). The Prospector starts from the
business profile — it knows what the customer sells, which journeys make them money, and
where they have spare capacity, because the Workflow Map already says so. The rationale on
every lead is written in terms of the customer's actual business, and rejections tune the
ICP. The data compounds exactly the way the rest of the platform promises.

## Compliance

B2B prospecting from public sources sits on legitimate interest under UK GDPR, but it must
be done properly: store business-contact data only, record the source URL for every datum,
honour erasure requests, and purge prospects untouched after a retention window. Cold email
to corporate addresses is permitted under PECR; personal addresses are not — the Assessor
labels which is which. Respect robots.txt and source terms; registry and API data over
scraping wherever both exist.

## Credit metering

| Action | Credits |
| --- | --- |
| ICP build or revision (Profiler) | 100 |
| Qualified prospect delivered (scored, with rationale) | 20 |
| Outreach draft | 10 |
| Export | Free — the data is theirs |

Cost per qualified prospect is a few pence (one website fetch, one Sonnet scoring call,
a share of the search spend); 20 credits is ~10–12p at pack rates, so margins hold at the
same level as agent replies. Candidates discarded below the score floor cost YBT a fraction
of a penny and the customer nothing.

## Build order

1. Prospect Directory tables + CSV export — value even with manually added prospects.
2. Profiler + ICP editor — the contract everything else consumes.
3. Scout with the Companies House adapter only — one source, end to end.
4. Assessor scoring loop, then Places and web-search adapters.
5. Pipeline view; outreach drafts last.
