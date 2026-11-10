# Feeding Your Business Brain from Microsoft 365

A business's own Claude reads its mail, SharePoint, OneDrive and Teams through Anthropic's
Microsoft 365 connector, and files what matters into the organisation's Your Business Brain
through the Your Business Today connector. Your Business Today has no Microsoft app of its own:
no Entra registration, no Connect Microsoft button, no stored Microsoft token and no sync. Claude
reads only what the person signed in to Microsoft 365 can already see, and Your Business Today
keeps only what Claude files.

## What the business sets up, once

1. **Your Business Brain switched on.** The organisation has the Your Business Brain module on,
   and the person is on the organisation.
2. **The Your Business Today connector in Claude.** Add a custom connector with the address
   `https://www.yourbusiness.today/api/mcp`, press Connect and sign in as usual.
3. **The Microsoft 365 connector in Claude.** Turn on Anthropic's Microsoft 365 connector and sign
   in with the business's Microsoft account. On Claude Team or Enterprise an owner of the Claude
   organisation turns it on first; some Microsoft 365 tenants also need their administrator to
   approve it for the tenant before anyone can sign in.
4. **Check both.** Ask Claude "list my organisations in Your Business Today" and "what are my
   five latest emails"; both should answer.

## What to ask Claude

Ask for one subject and a date range at a time, never a whole mailbox, site or team. For example:

- "Read the Elm Court roof thread in the office mailbox from 3 to 7 November and file what was
  decided into Jewel's Your Business Brain."
- "File the staff handbook in the HR SharePoint site into our brain, one page per policy."
- "Read the Estimating channel in Teams for October and file how we price fire doors."

Claude then:

- files one coherent piece to a page, in the part of the business it belongs to;
- titles the source as a person would know it, such as *Mail thread: Roof at Elm Court, 3 to 7 Nov
  2026*, and puts in the source where it can be opened again: the SharePoint or OneDrive web link
  of the file, the mailbox and subject of the thread, or the Teams team and channel;
- files several pages from one folder or thread in one call (`file_business_brain_pages`, up to 20
  pages), with the source named once beside them; each page is settled on its own, so one that
  does not fit or is already filed is answered by its number and the rest are filed;
- revises a page already filed on the subject instead of filing a second one, keeping the earlier
  version in its history;
- keeps the document itself with the brain where it is worth keeping, through the upload link.

Every page read back with `read_business_brain_page` names its source and where it can be found,
so whoever asks the brain later can open the email, file or channel it came from.

## What stays by hand

- Nothing is filed until someone asks Claude to file it; there is no background sync.
- Claude asks before filing anything it is unsure of, and never files a password, a key, or
  personal details the business has no need to keep.
- If feeding the brain this way becomes a daily habit for a business, a scheduled or in-site
  connection is a new story, not part of this route.
