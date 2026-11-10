# Connecting Claude to Your Business Brain

Your Business Brain is an organisation's own private memory: its people, clients, suppliers, rules, processes and facts, filed page by page by the organisation's own Claude. Your Business Today keeps the pages and calls no AI model. The person's Claude does the reading and the thinking.

## Connecting

1. Your Business Today staff switch Your Business Brain on for the organisation (`set_organisation_module`). Every organisation starts with it off.
2. The person adds the Your Business Today connector to Claude, as the portal's **Connect your Claude** page shows (`/portal/connect`): the connector address, then Customize › Connectors › Add custom connector, and sign in with the account they use for the portal.
3. Claude now has the brain's reading actions: `read_business_brain_index`, `search_business_brain` and `read_business_brain_page`.

## Reading through a chatbot

A manager of the organisation can open part of the brain to people who are not on it, or who should read only part of it, by making a chatbot (`make_business_brain_chatbot`): its name, the parts it reads (expertise, experience, process or people) and the people who may use it, named by the email they sign in to Your Business Today with.

Each of those people connects their own Claude as above and reads through the chatbot:

1. `list_my_chatbots` lists the chatbots they may use now, with the parts each reads and its id.
2. `read_chatbot_index`, `search_chatbot` and `read_chatbot_page` each take the `chatbotId` and the person's `question` in their own words, and read as the brain's own reading actions do, but only the parts that chatbot reads. A part or a page outside them is refused, and a page's related pages show only those the chatbot also reads. The first reading for a question gives back its `questionId`; further readings for the same question give it too.
3. `record_chatbot_answer` puts the answer Claude gave on the record, under the `questionId`, word for word, with the page ids it cited.

### Every question is kept on record

Every question asked through a chatbot is kept on the organisation's record (migration 0175), so the business can prove what was and was not asked:

- **What Your Business Today sees for itself:** who asked (their account and the email they signed in with at the time), which chatbot, the question in the words the person's Claude gave, every reading made for it (the words searched, the part listed or the page read) and the pages given back with the version of each, and the time. A refused reading, including one by a person the chatbot no longer names, and a reading that found nothing are kept as such.
- **What the person's Claude reports:** the answer it gave and the pages it cited. A question with no answer reported shows as that, and a cited page no reading gave back is marked.
- **Nothing on it is ever changed or deleted**, by anyone, from the app or the connector: the database refuses every change and every delete. It is kept for as long as the organisation's Your Business Brain is kept.

A manager of the organisation, or staff, reads it with `list_business_brain_chatbot_questions`, narrowed by chatbot, person and days (UK time). The page on the site that searches it and downloads it is a later step.

A chatbot only reads: nothing is filed or changed through it. A person the chatbot does not name now, or anyone at all while Your Business Brain is switched off for the organisation, is refused. Their own Claude does the asking; Your Business Today calls no AI model.

## Judging a photo against the brain

Claude already sees images, so a photo is judged in the person's own Claude. Claude looks at the photo and describes what it shows in words; the brain supplies the business's rules; Claude gives the judgement and the pages it relied on. The photo never reaches Your Business Today: the connector receives words, never the picture, and nothing about the photo is stored.

### What to say

Drop the photo into Claude and ask in plain words, naming the organisation when Claude is connected to more than one:

> Here is a photo from site at the end of the day. Is it in order by Jewel's Your Business Brain?

Or ask about one thing:

> Check this photo against our rules on ladders.

A set of photos is asked one photo at a time.

### What Claude does

1. Describes in words everything in the photo that a rule could bear on: *two ladders standing against the scaffold, a skip with its lid open, the gate shut*.
2. Takes one observation at a time and searches the brain in the words the business uses: `search_business_brain` with *ladders end of the day*.
3. Reads whole each page that bears on it with `read_business_brain_page`, because an excerpt is not the page.
4. Judges the observation against the rules those pages hold, and only those.

### What comes back

Each observation gets one of three findings, with the page behind it:

- **Not in order:** the rule it breaks and the page that sets it.
- **In order:** the rule it meets and the page that sets it.
- **Cannot be judged:** the photo does not show enough to tell.

Where the brain holds no rule on something the photo shows, Claude says the brain is silent on it and gives no verdict, not even what is usual elsewhere, and offers to file the rule once the person states it.

For example:

> **Ladders: not in order.** Two ladders are left standing against the scaffold. *Putting the site away* (page id 3f1c…) says ladders are always taken down and locked in the cabin at the end of the day.
>
> **Gate: in order.** The site gate is shut and padlocked, as *Securing the site* (page id 8a02…) requires.
>
> **Skip: the brain is silent.** The skip's lid is open, but no page says whether skips are covered overnight. Tell me the rule and I'll file it.

### What it never does

- Sends or uploads the photo to Your Business Today, or files it into the brain.
- Judges against a rule the brain does not hold, or fills a gap from general knowledge as if the brain said it.
- Gives a finding without the title and page id of the page it rests on.
