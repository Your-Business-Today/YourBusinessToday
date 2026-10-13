# Sales Patches — Architecture

How staff work an area rather than a name: a patch of ground they own, every company
registered in it as at now, the sectors they have covered, what their own Claude found on
the open web, and a feed of what changed. This is the staff side of the sales pipeline
goal; the lead generation doc ([lead-generation-architecture.md](./lead-generation-architecture.md))
describes the map search this grows out of, and its rule that a search result not added is
not kept has one deliberate exception here: the register snapshot, kept so change can be read.

## User stories

| As | I want | So that |
| --- | --- | --- |
| Staff | to save an area (a centre postcode, a radius, optional SIC codes) as a named patch that is mine | Kingston is a thing on the site that keeps what I do in it, and a second staff member has their own |
| Staff | a map of the UK with every patch drawn on it, and to start a new patch by clicking where I want it | I see what we cover at a glance and choose the next area from the map |
| Staff | the patch map drawn on a basemap we are allowed to use commercially | a second person panning it never gets us blocked |
| Staff | every live company in the latest monthly Companies House file whose registered office is in a patch stored in our database | the patch map shows the businesses there now without the API key |
| Staff | every register postcode in my patches geocoded through the cache the map already uses | the register can be drawn and nothing geocodes twice |
| Staff | every live company registered in my patch on the patch map as at the latest monthly file, hubs and dormant shells told apart | I see the businesses there now and know which pins are registered offices rather than shops |
| Staff | my patch drawn as every one of its postcode sectors, including the ones where nobody is registered | the coverage map can never miss a sector and I can see the ground I am meant to cover |
| Staff | to mark a sector searched with one line on what I did and have the map tint it | I can graphically see that I have covered everywhere and which sectors have gone stale |
| Staff | to claim a sector before I search it, release it, or hand it to a named colleague, with only the claimant or the patch owner able to mark it searched | two of us in two cities never tread on the same ground and coverage is a signed claim, not a guess |
| Staff | my own Claude to read a sector, search the web for the businesses trading in it and record each one it finds with the page it saw it on | I keep searching within my subscription until I am happy, and every record says where it came from |
| Staff | to promote a sighting to a lead with its source kept, stamp a confirmed company number on it, and have my Claude know the prospecting walk from the start of every session | the good ones reach the pipeline and nothing is recorded twice |
| Staff | everything that happens in my patches recorded as events my Claude can read in one call | a Monday-morning task sees what changed and every later source writes through the same door |
| Staff | a feed page of what changed in my patches, mine first | I see new sightings, searched sectors and leads as they happen, and each staff member sees their own |
| Staff | the feed to show, each month, the companies new in my patch, the ones that have gone, and the ones whose status, accounts, due dates or charges changed | I know when a new target arrives or an existing one's situation changes, with no key |
| Staff | a company flagged when a new holding company appears over an existing trading one | I can see who has just decided they need management information |
| Staff | my own Claude, on a weekly schedule in my own claude.ai, to look at my patch for anything notable on a public page and record it with its link | a target's changed methodology reaches my feed without YBT paying for the search |

The stories that follow — every registered company in a patch, every postcode sector drawn
and marked searched, sightings a person's Claude records with their source, the feed of
changes and the watchers behind it — are the backlog under *Create a Successful Sales
Pipeline* in Your Business Today, one task per step, and are written here as each lands.

## The views

- `/clients/patches` — a map of Great Britain with every live patch as a circle of its radius,
  the create form (prefilled with the postcode nearest a click, through postcodes.io's reverse
  lookup), and the list: name, centre, radius, outcodes, who works it.
- `/clients/patches/[patchId]` — the patch: its header with the outcodes as chips, the
  register line (as at which month, how many companies, hubs, dormant, postcodes still to
  geocode), then the circle map with every register company within the radius as a pin, the
  company panel and the nearest companies as a list. A registered-office hub — an address
  holding twenty or more companies, an agent's office — is one pin; a dormant company or one
  with no accounts filed is drawn muted. Add as lead and Add with directors post to the same
  actions as the area map. Beneath the pins every postcode sector of the patch is drawn, from
  OS Code-Point Open, as its shape (a circle at its centroid until the shapes are loaded), labelled,
  and tinted by its coverage: outlined until a person has searched it, amber with the holder's
  initials while claimed, green when searched, dashed when that was over ninety days ago. The
  coverage strip above counts them; while shapes are drawn the OS, Royal Mail and National Statistics
  credit sits at the foot of the map. Choosing a sector opens its panel: where its shape came from, who holds it, every search
  with who, when and the one-line summary, Claim, Release and Hand to, and the Mark searched form.
- `/clients/patches/[patchId]/sectors/[sector]` — one sector alone: the same panel and every
  company registered in it, for a link from a Claude or a colleague.
- Sightings are pins of their own on the patch map, in their own tone; choosing one opens its
  panel: what the page showed, the page itself, who saw it and when, Add as lead, and Match to
  a company number on the register. `/clients/patches/[patchId]/sightings` lists every sighting
  in the patch, and the sector panel carries the form to record one by hand.
- `/clients/feed` — what changed on the ground, newest first under day headings: sectors claimed
  and searched, businesses sighted, leads added, companies arrived, moved in or left, status and
  accounts changes, charges, a holding company formed over a trading one, and what a weekly sweep
  observed. Chips narrow it to my patches, one patch, or one kind; it re-reads itself every half
  minute while open. Each company's own page lists what was observed about it.
- `/clients` gains a Patches door beside Map an area; the Business menu gains Patches.

## The entities

**Patch** — `public.patches`: `name` (unique, at most 80 characters), `centre_postcode`,
`radius_miles` (one of the map's radii), `sic_codes`, `owner_account_id`. **PatchOutcode** — `public.patch_outcodes`: the outcodes within the radius,
laid out once from postcodes.io when the patch is saved. Both are managed by project managers.

**RegisterCompany** — `public.register_companies`, keyed by company number: what the monthly
Companies House file says about every live company registered in a patch outcode — name,
registered address and postcode, outcode and sector, status, incorporation date, account
category, SIC codes, next accounts and confirmation statement due, charge count — with the
first and last month it was seen and `is_gone` for a company a later file no longer carries.
Never purged, so the as-at count and the diff between months stay true. **RegisterLoad** —
`public.register_loads`: which outcode was loaded for which month and how many companies.
**WatchRun** — `public.watch_runs`: one row per loader or watcher run. **SuppressedCompany** —
`public.suppressed_companies`: the erasure path every loader skips. YBT is controller of this
extract of a public register under UK GDPR, keeps business data only, and honours an
objection by suppressing the company number.

The loader is `node scripts/register/load-register-file.mjs <BasicCompanyDataAsOneFile-YYYY-MM-01.zip>`
with `PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` set: it streams the CSV out of the zip,
keeps the rows whose outcode any patch holds, skips suppressed and malformed rows, upserts
through `upsert_register_companies` (a company seen before keeps its first month), marks the
missing gone, and writes `register_loads` and a `watch_runs` row. It does no geocoding: the
`geocode_register_postcodes` admin action, called until nothing remains, fills
`postcode_locations` through the same cache the map uses.

**PostcodeSector** — `public.postcode_sectors`: every sector in Great Britain from OS
Code-Point Open (OGL, quarterly), its outcode, the centroid of its unit postcodes and how many,
with room for a boundary. Loaded by `node scripts/sectors/load-code-point-open.mjs <codepo_gb.zip>`,
which converts British National Grid to WGS84 in `britishNationalGrid.ts` and `helmertDatumShift.ts`.
A sector with no registered company still has a row, so the coverage map can never miss one.

Each sector's shape is loaded by `node scripts/sectors/load-sector-shapes.mjs <codepo_gb.zip> <bdline_gb.gpkg>`,
regenerated each quarter when Code-Point Open is released: the Voronoi tessellation of the sector
centroids (the ground nearer each centroid than any other's), cut at the coast by the OS Boundary-Line
`country_region` layer and simplified to `shapeToleranceMetres` in `sectorShapeRules.ts`, written to
`boundary` as GeoJSON with `boundary_source` `code_point_voronoi`. It is an approximation drawn from the
postcodes, not Royal Mail's own sector boundary; the GeoLytix 2012 sector polygons (OGL) were the
alternative and were not used: drawn in 2012, they miss every sector created since.

**SectorSearch** — `public.sector_searches`: one row each time a person marks a sector searched:
the patch, the sector, what was searched (`open_web`, `register_file`, `food_hygiene`, `gazette`,
`companies_house`), who, when, how many businesses were found and one line on what was done.
Coverage is never a column: `sectorCoverage.ts` derives unsearched, claimed, searched or stale
(after ninety days) from these rows and the claims, and automatic loads never write them.

**SectorClaim** — `public.sector_claims`: one holder per sector per patch. A sector is marked
searched by whoever holds its claim or by the patch owner, and the marking spends the claim; an
unclaimed sector may be marked by anyone on the register, so a search is never lost for want of
a claim. A claim is handed to a colleague found by email, who must be staff.

**Sighting** — `public.sightings`, keyed by sector rather than patch, so two people whose patches
share a sector see the same sightings: the business as it names itself, address and postcode
(which must fall in the sector), a company number once confirmed, its website, the public page it
was read on and what kind of page that is, what the page showed, who saw it, when, and the client
it became. One row per business per page per sector. The page must be public http(s) and never
LinkedIn, X, Facebook or Instagram: the server refuses those, not only the doctrine. The server
reads no page itself; the staff member's own Claude does the searching on its own subscription
and the only calls that reach YBT store what it found.

A sighting becomes a lead with source `sighting`, its page as the profile source and a `sighted`
event on the ledger; one already matched to a company number on the register claims that row.
The connector's working doctrine gains the prospecting walk as its ninth rule.

**AreaEvent** — `public.area_events`, keyed to the outcode and sector rather than the patch, so
two patches that share a sector both see it: the kind (a row of `area_event_kinds`, so a later
step adds one by inserting it), the company, sighting or client it is about, one line of detail,
the page it came from, a source key that makes a loader re-run write once, when it happened and
who did it. One trusted insert, `write_area_event`, is reached two ways: the gated door
`record_area_event`, which refuses anyone but staff and the service role and is what the site's
commands and the connector call, and the triggers on `register_companies`. The monthly loader
therefore produces the register's events itself: a company first seen after an outcode's first
load is *arrived* when incorporated within ninety days of the month, *moved in* otherwise; one a
later file no longer carries has *left*; a changed status, account category or charge count, and
accounts falling overdue, each write theirs; and a company registered under a holding or
head-office SIC code at the address of a live trading company is flagged the month it appears.

**Observation** — `public.observations`: something a staff member's own Claude noticed on a
public page in the last week about a register company or a sighting, with the page, once per
page per patch. `read_patch_brief` hands a weekly scheduled task the sectors most in need of a
visit and a page of companies longest unobserved, capped so one run stays within a subscription;
`docs/patch-sweep-prompt.md` is the task's prompt word for word.

**WatchRun and the cron door** — `/api/watch/<source>` is knocked on by Vercel's cron runner with
`CRON_SECRET` as a bearer token; `watchSources.ts` is the registry and a name not in it is refused.
Every run is a `watch_runs` row opened, marked after each unit of work and closed with where it
got to, so a run the platform cuts off resumes from its marker. The sources are the heartbeat,
the register geocoder, the Food Standards Agency sweep, the daily accounts file and The Gazette.

**Premises** — `public.premises`: a business trading at a real address as an open register lists
it, keyed by the source and its own id: the Food Standards Agency's food hygiene ratings
(`food_hygiene`, swept nightly per local authority whose file moved, matched to the patches'
districts through postcodes.io) and Overture Maps Places (`places_dataset`, loaded by hand each
release through DuckDB over the public parquet, permissive licences only, marked gone only by the
release's changelog). A trigger writes the feed's premises and place kinds through the same door.

**Filed figures and status notes** — `register_companies` carries net assets, cash, creditors and
the headcount read from the inline XBRL of the accounts the company filed, found through the
daily Accounts Data Product zip opened by its central directory over HTTP range requests; and a
status note stamped by The Gazette's corporate insolvency notices, which tones the pin.

**Building** — `public.buildings` and `public.premises_points`: OS OpenMap Local footprints
in the patch's circle with the Open UPRN points that fall inside each and the nearest Code-Point
Open unit postcode with its distance, loaded by hand each April and October; a reload replaces
the patch's rows whole. The map draws them at street zoom, green where a premises or an addressed
sighting stands within thirty metres, chalk where nothing is known yet; registered offices are
listed apart with no tenancy claimed.

**The keyed watchers** — once `COMPANIES_HOUSE_API_KEY` exists, the `register` source asks the
advanced search outcode by outcode for the companies incorporated, dissolved or in trouble since
the last day checked and writes what an answer carries through `upsert_watched_companies`, which
leaves the accounts columns the monthly file fills alone; the `filings` source reads the filing
history and profile of the companies longest unchecked, a page a week, keeps the filings in
`company_filings`, tells the feed the new ones as the kind each is (`filingKinds.ts` maps the
register's description ids), and the standing flags on the register row. Every keyed call waits
for the window the last answer named (`rateBudget.ts`). Without the key each source says so and
does nothing. `standingLine.ts` reads the accounts, the figures, the flags and the notice as one
sentence on every company panel.

The centre is geocoded into `postcode_locations` as the patch is saved, so the overview map
costs no lookup. Every limit is stated in `src/lib/data/patchRules.ts` and read by the form,
the form action and the connector action; `validatePatch` refuses rather than repairs.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `createPatch` | the area becomes a patch with its outcodes |
| `loadRegisterFile` | the monthly file becomes register rows for every patch outcode |
| `geocodeRegisterPostcodes` | one page of register postcodes located through the cache |
| `loadCodePointOpen` | every sector in Great Britain with its centroid |
| `loadSectorShapes` | every sector drawn as a shape rather than a circle, each quarter |
| `recordSectorSearch` | a sector marked searched, the claim spent |
| `claimSector`, `releaseClaim`, `passClaim`, `handSectorTo` | who holds a sector |
| `recordSighting` | a business seen on a public page, once |
| `addSightingAsLead`, `matchSightingToRegister` | the sighting reaches the register |
| `recordAreaEvent` | every event, through the gated door |
| `recordObservation` | something noticed, once per page |
| `runWatchSource` | a named watcher run from where it last stopped |
| `sweepFoodHygiene`, `sweepAccountsFiled`, `sweepGazetteNotices` | the keyless sources, nightly |
| `loadBuildingsForPatch`, `loadOverturePlacesForPatch` | the buildings and the trading places, by hand |
| `addPremisesAsLead` | a premises reaches the register |
| `watchRegister`, `watchOutcode` | the daily Companies House watch, keyed |
| `sweepFilings`, `sweepCompanyFilings` | the weekly filings sweep, keyed |

| Query | Story it serves |
| --- | --- |
| `listPatches`, `listPatchesWithCentres` | the list and the overview map |
| `getPatch` | one patch |
| `reverseLookupPostcode` | the postcode under a click |
| `mapPatch`, `readRegisterForPatch`, `pinsForRegister` | the register in a patch as pins, hubs folded, shells muted |
| `readPatchCoverage`, `unsearchedFirst` | every sector with its coverage, the most needed first |
| `readSector` | one sector: coverage, searches, companies |
| `listSightingsForPatch`, `pinsForSightings` | the sightings, drawn at their postcodes |
| `getFeedForPatches` | the feed, narrowed by patch, kind or date |
| `readPatchBrief` | what a weekly sweep looks at |
| `listPremisesForPatch`, `pinsForPremises` | the premises, drawn at their real addresses |
| `listBuildingsInBounds`, `readSectorBuildings` | the footprints in view, and a sector's largest |
| `readCompanyInPatch` | everything known about one company |
| `getFilingHistory`, `getCompanyProfile`, `listFilingsForCompany` | a company's filings, live or stored |

The connector's new `patches` area carries `list_patches`, `create_patch`, `read_patch`,
`read_patch_companies`, `add_patch_company_as_lead`, `list_patch_sectors`, `list_unsearched_sectors`,
`read_sector`, `mark_sector_searched`, `claim_sector`, `release_sector`, `hand_sector_to`,
`record_sighting`, `list_sightings`, `add_sighting_as_lead`, `match_sighting_to_register`,
`read_patch_feed`, `read_patch_brief`, `record_patch_observation`, `list_patch_premises`,
`add_premises_as_lead`, `read_patch_company`, `read_company_filings` and, for admins,
`geocode_register_postcodes` and `run_patch_watch`;
the map tiles come from `basemap.ts`: Ordnance Survey's Light style on the free OpenData plan
when `PUBLIC_OS_MAPS_API_KEY` is set, OpenStreetMap only as the fallback.
