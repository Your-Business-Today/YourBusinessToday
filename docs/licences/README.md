# Licences of the open data the patches draw on

The data itself is never checked in; the loaders read it and the rows carry the release they came from. The licence texts are fetched from their keepers, not retyped here, so the words shown are the words that bind.

| Data | Licence | Where the text is | Credit shown |
| --- | --- | --- | --- |
| Ordnance Survey OpenMap Local, Open UPRN, Code-Point Open, OS Maps API OpenData plan | Open Government Licence v3.0 | https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/ | Contains OS data © Crown copyright and database right <year> |
| Food Standards Agency food hygiene ratings | Open Government Licence v3.0 | as above | Food hygiene ratings from the Food Standards Agency; contains public sector information licensed under the Open Government Licence v3.0 |
| Companies House Free Company Data Product and Accounts Data Product | Companies House places no restriction on the use of the register data | https://www.gov.uk/guidance/companies-house-data-products | — |
| The Gazette notice feeds and per-notice data | Open Government Licence v3.0 | as above | — |
| Overture Maps Foundation Places | CDLA-Permissive 2.0 for the dataset; each row's `sources[].license` names its own (Meta's places under CDLA-Permissive 2.0, Microsoft's under ODbL, Foursquare's open places under Apache 2.0) | https://cdla.dev/permissive-2-0/ and the release's own NOTICE file at https://docs.overturemaps.org/attribution/ | Overture Maps Foundation, with the per-source lines the attribution page gives |

A row from Overture whose source licence is ODbL is kept out by the loader (`placeLicencesAccepted` in `src/lib/data/placeRules.ts`), because a share-alike licence would bind this database.
