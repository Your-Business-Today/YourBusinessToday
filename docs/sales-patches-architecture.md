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
| Staff | to save an area (a centre postcode, a radius, optional SIC codes) as a named patch that is mine | Kingston is a thing on the site that keeps what I do in it, and a colleague in Manchester has her own |
| Staff | a map of the UK with every patch drawn on it, and to start a new patch by clicking where I want it | I see what we cover at a glance and choose the next area from the map |
| Staff | the patch map drawn on a basemap we are allowed to use commercially | a second person panning it never gets us blocked |
| Staff | every live company in the latest monthly Companies House file whose registered office is in a patch stored in our database | the patch map shows the businesses there now without the API key |
| Staff | every register postcode in my patches geocoded through the cache the map already uses | the register can be drawn and nothing geocodes twice |
| Staff | every live company registered in my patch on the patch map as at the latest monthly file, hubs and dormant shells told apart | I see the businesses there now and know which pins are registered offices rather than shops |
| Staff | my patch drawn as every one of its postcode sectors, including the ones where nobody is registered | the coverage map can never miss a sector and I can see the ground I am meant to cover |
| Staff | to mark a sector searched with one line on what I did and have the map tint it | I can graphically see that I have covered everywhere and which sectors have gone stale |
| Staff | to claim a sector before I search it, release it, or hand it to a named colleague, with only the claimant or the patch owner able to mark it searched | two of us in two cities never tread on the same ground and coverage is a signed claim, not a guess |

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
  OS Code-Point Open, as a circle at its centroid (a shape once a boundary is loaded), labelled,
  and tinted by its coverage: outlined until a person has searched it, amber with the holder's
  initials while claimed, green when searched, dashed when that was over ninety days ago. The
  coverage strip above counts them. Choosing a sector opens its panel: who holds it, every search
  with who, when and the one-line summary, Claim, Release and Hand to, and the Mark searched form.
- `/clients/patches/[patchId]/sectors/[sector]` — one sector alone: the same panel and every
  company registered in it, for a link from a Claude or a colleague.
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

**SectorSearch** — `public.sector_searches`: one row each time a person marks a sector searched:
the patch, the sector, what was searched (`open_web`, `register_file`, `food_hygiene`, `gazette`,
`companies_house`), who, when, how many businesses were found and one line on what was done.
Coverage is never a column: `sectorCoverage.ts` derives unsearched, claimed, searched or stale
(after ninety days) from these rows and the claims, and automatic loads never write them.

**SectorClaim** — `public.sector_claims`: one holder per sector per patch. A sector is marked
searched by whoever holds its claim or by the patch owner, and the marking spends the claim; an
unclaimed sector may be marked by anyone on the register, so a search is never lost for want of
a claim. A claim is handed to a colleague found by email, who must be staff.

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
| `recordSectorSearch` | a sector marked searched, the claim spent |
| `claimSector`, `releaseClaim`, `passClaim`, `handSectorTo` | who holds a sector |

| Query | Story it serves |
| --- | --- |
| `listPatches`, `listPatchesWithCentres` | the list and the overview map |
| `getPatch` | one patch |
| `reverseLookupPostcode` | the postcode under a click |
| `mapPatch`, `readRegisterForPatch`, `pinsForRegister` | the register in a patch as pins, hubs folded, shells muted |
| `readPatchCoverage`, `unsearchedFirst` | every sector with its coverage, the most needed first |
| `readSector` | one sector: coverage, searches, companies |

The connector's new `patches` area carries `list_patches`, `create_patch`, `read_patch`,
`read_patch_companies`, `add_patch_company_as_lead`, `list_patch_sectors`, `list_unsearched_sectors`,
`read_sector`, `mark_sector_searched`, `claim_sector`, `release_sector`, `hand_sector_to` and, for
admins, `geocode_register_postcodes`;
the map tiles come from `basemap.ts`: Ordnance Survey's Light style on the free OpenData plan
when `PUBLIC_OS_MAPS_API_KEY` is set, OpenStreetMap only as the fallback.
