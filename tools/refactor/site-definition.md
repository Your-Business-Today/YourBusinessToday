# Site definition

Written on 2026-11-12 from the views themselves — by the widget identification or the code quality check, never by hand, so it is never stale. Each route is what a user sees there, in the widget notation; each component of the site is defined the same way.

**68 routes, 649 components of the site, 13 catalogue widgets.** 372 widget usages and 0 pieces of markup written by hand where a widget should be, in 0 views; 0 content widgets draw their own box.

**Notation.** `a, b` stacked top to bottom · `[ a b ]` side by side · `(3) a` three of them, `(n) a` one per item · `?when: a` shown on a condition · `( a | b )` one or the other · `Widget{ … }` a catalogue widget with its content · `Part=( … )` one of the site's own components opened out · `⚠table→RecordsTable` markup written by hand where the named widget should be.

## Written by hand where a widget should be

Nothing is written by hand where a widget should be.

## Content widgets that draw their own box

No content widget draws its own box.

## The widgets' designs

Brand sheet: `docs/design/brand.md`, the site last checked against it never. 7 of 13 catalogue widgets have a design sheet; the widgets were last checked against them on 2026-11-10. Say *"Check the site against the brand"* and *"Check the widgets against their designs"* to run the checks, *"Extract the brand from <references>"* and *"Extract the design for <Widget> from <images>"* to bring the sheets up to date (the `widget-design` skill) — each a judgement, so run on request, never by the audit.

| Widget | Design | Last checked |
| --- | --- | --- |
| `Badge` | `docs/design/widgets/Badge.md` | 2026-11-10 |
| `BreakdownTable` | brand only | — |
| `Button` | `docs/design/widgets/Button.md` | 2026-11-10 |
| `DashboardPanel` | `docs/design/widgets/DashboardPanel.md` | 2026-11-10 |
| `EmptyState` | brand only | — |
| `FormField` | `docs/design/widgets/FormField.md` | 2026-11-10 |
| `InlineField` | brand only | — |
| `Modal` | `docs/design/widgets/Modal.md` | 2026-11-10 |
| `PageTitle` | brand only | — |
| `RecordsTable` | `docs/design/widgets/RecordsTable.md` | 2026-11-10 |
| `Sheet` | brand only | — |
| `TabStrip` | `docs/design/widgets/TabStrip.md` | 2026-11-10 |
| `WorkspaceHeader` | brand only | — |

## Routes

### `/about`
`src/routes/about/+page.svelte`

```
PageMeta, AboutStorySection, AboutTeamSection=( (n) TeamMemberProfile ), DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/account`
`src/routes/account/+page.svelte`

```
[ PageTitle SubmitButton ], Modal{ DisplayNameForm=( SmallCapsField=( FormField ), FormErrorNote, SubmitButton ) }
```

### `/account/set-password`
`src/routes/account/set-password/+page.svelte`

```
PageTitle, (2) SmallCapsField=( FormField ), FormErrorNote
```

### `/account/sign-in`
`src/routes/account/sign-in/+page.svelte`

```
PageTitle, EmailPasswordForm=( (2) SmallCapsField=( FormField ), FormErrorNote ), GoogleSignInButton
```

### `/admin`
`src/routes/admin/+page.svelte`

```
PageTitle, BuildModelsPanel=( ReviewModelForm=( [ FormField SubmitButton FormErrorNote ] ), (n) BuildModelRow=( [ (2) PointsSelect=( InlineField ) SubmitButton ], FormErrorNote ), BuildModelRow=( [ (2) PointsSelect=( InlineField ) SubmitButton ], FormErrorNote ) ), (n) AdminUserRow=( AdminActionsMenu=( ActionsMenu{ (3) AdminMenuAction, ?!user.isAdmin: AdminMenuAction }, SetPasswordModal=( Modal{ SmallCapsField, FormErrorNote, SubmitButton } ) ) )
```

### `/admin/documents`
`src/routes/admin/documents/+page.svelte`

```
PageTitle, BeforeFirstUseNote, (2) ClientDocumentList=( (n) ClientDocumentRow )
```

### `/admin/documents/[slug]`
`src/routes/admin/documents/[slug]/+page.svelte`

```
DocumentProse
```

### `/admin/stripe-payments`
`src/routes/admin/stripe-payments/+page.svelte`

```
PageTitle, DashboardPanel{ StripeEventsToCheckTable=( RecordsTable{ (3) RecordsCell, RecordsCell{ Badge }, RecordsCell, RecordsCell{ Button } } ) }
```

### `/case-study`
`src/routes/case-study/+page.svelte`

```
PageMeta, CaseStudyIntroSection, (n) CaseStudyBusinessSection=( CaseStudyOutcomes ), PortalScreensSection=( (n) PortalScreenCard ), CaseStudyMethodSection, DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/clients`
`src/routes/clients/+page.svelte`

```
SalesRegisterPage=( WorkspaceHeader, RegisterStageTabs=( TabStrip ), FormErrorNote, ( ?clients.length === 0: EmptyState | ClientTable=( (n) ClientRow=( ClientStageForm ) ) ) )
```

### `/clients/[clientId]`
`src/routes/clients/[clientId]/+page.svelte`

```
ClientHeader=( PageTitle ), FormErrorNote, CompanyJobAdverts=( FindJobAdvertsButton=( Modal{ AskClaudeToFindJobAdverts=( CopyTextButton ) } ), (n) JobAdvertRow ), CompanyProfileForm=( [ FormField CompanyPlaceFields=( (2) FormField ) FormField CompanyScaleFields=( (2) FormField ) ], CompanyNarrativeFields=( (2) FormField ), SubmitButton ), ClientPeopleSection=( ClientPeopleActions=( ?canImportOfficers: SubmitButton ), (n) PersonCard=( ?canInvite: SubmitButton, PersonFacts=( WarmthPill ), PersonLinkList=( (n) PersonLinkChip, SubmitButton ), PersonNoteTimeline=( ProseText, SubmitButton ) ), Modal{ NewContactForm=( (4) FormField, SubmitButton ) }, Modal{ ClientSetUpForm=( (2) FormField, SubmitButton ) }, Modal{ ?personBeingEdited !== null: PersonFieldsForm=( [ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields=( (5) FormField ) ], SubmitButton ) }, Modal{ ?personToApproach !== null: AskClaudeToDraftApproach=( CopyTextButton ) } ), ClientGroupSection=( ?children.length > 0: StagePill, ?children.length === 0 && parent…: GroupUnderForm=( SubmitButton ) ), ClientProjectList, ClientContinuityCopySection=( [ (3) FormField ], SubmitButton ), SupportTaskTable=( RecordsTable{ (4) RecordsCell } ), ClientObservations=( ?observations.length > 0: (n) ObservationRow ), ClientEventLedger, ClientDeletion=( DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ), Modal{ AssignProjectForm=( FormField, (2) FormField, SubmitButton ) }
```

### `/clients/[clientId]/context`
`src/routes/clients/[clientId]/context/+page.svelte`

```
WorkspaceHeader, ( ?data.reading === null: EmptyState | CompanyContextView=( CompanyContextMap=( (n) ContextAreaRegion, (n) ContextLinkLine, (n) ContextPartNode ), ( ?selectedPart === undefined: EmptyState | ContextPartPanel=( DashboardPanel{ ?steps.length > 0: ContextProcessStepList=( ?step.roleKey !== null: EntityLink ), ContextPartLinkList=( (2) EntityLink ), ?canMark: ContextPartReviewForm=( ?isNotRight: FormField, FormErrorNote, SubmitButton ) } ) ), ContextConfirmationPanel=( DashboardPanel{ ?isOpen: ContextConfirmForm=( FormErrorNote, SubmitButton ) } ), ?changes !== null: ContextChangesPanel=( DashboardPanel{ ?hasChanges(changes): (2) ContextChangeList=( (n) EntityLink ) } ) ) )
```

### `/clients/feed`
`src/routes/clients/feed/+page.svelte`

```
AreaFeedHeader=( [ PageTitle LiveMarker ], (2) FeedScopeChips ), AreaFeedScoreboard=( [ (4) StatTile ] ), ( ?days.length === 0: EmptyState | ( (n) FeedDaySection, AreaEventRow=( AreaEventPill ) ) )
```

### `/clients/map`
`src/routes/clients/map/+page.svelte`

```
PageTitle, AreaSearchForm=( (3) FormField, SubmitButton ), LeadOutcomeNote=( FormErrorNote ), ?area !== null: ( AreaSummary, AreaMapWorkspace=( AreaMapPane=( AreaMap, AreaLegend ){ AreaCompanyPanel=( ?isOneCompany: FindJobAdvertsButton=( Modal{ AskClaudeToFindJobAdverts } ), ( ?registerStanding !== null: RegisterStandingLink=( StagePill ) | ?canBecomeLead: [ (2) ( ProspectSeedFields, SubmitButton ) ] ) ), AreaCompanyList=( (n) AreaCompanyRow=( ?standing !== null: StagePill ) ) } ) )
```

### `/clients/patches`
`src/routes/clients/patches/+page.svelte`

```
PageTitle, FormErrorNote, PatchesOverview, CreatePatchForm=( (4) FormField, SubmitButton ), ( ?patches.length === 0: EmptyState | PatchTable=( (n) PatchRow ) )
```

### `/clients/patches/[patchId]`
`src/routes/clients/patches/[patchId]/+page.svelte`

```
PatchHeader=( PageTitle ), LeadOutcomeNote=( FormErrorNote ), CoverageStrip=( [ (4) StatTile ] ), ?map !== null: ( PatchSummary, PatchMapPane=( PatchMap, SectorLegend, AreaLegend ), PatchSidebar=( ( ?selectedBuilding !== null: BuildingPanel | ?sector !== null && sectorCovera…: SectorPanel=( SectorClaimForms=( [ ?isClaimed: SubmitButton SubmitButton SubmitButton ] ), SightingForm=( [ (6) FormField ], FormField, SubmitButton ), SectorSearchForm=( (3) FormField, SubmitButton ), ?searches.length > 0: (n) SectorSearchRow ) | ?selectedPremises !== null: PremisesPanel=( SubmitButton ) | ?selectedSighting !== null: SightingPanel=( ( ?standing !== null: RegisterStandingLink=( StagePill ) | SubmitButton ), SubmitButton ) | AreaCompanyPanel=( ?isOneCompany: FindJobAdvertsButton=( Modal{ AskClaudeToFindJobAdverts } ), ( ?registerStanding !== null: RegisterStandingLink=( StagePill ) | ?canBecomeLead: [ (2) ( ProspectSeedFields, SubmitButton ) ] ) ) ), AreaCompanyList=( (n) AreaCompanyRow=( ?standing !== null: StagePill ) ) ) )
```

### `/clients/patches/[patchId]/sectors/[sector]`
`src/routes/clients/patches/[patchId]/sectors/[sector]/+page.svelte`

```
PageTitle, FormErrorNote, SectorPanel=( SectorClaimForms=( [ ?isClaimed: SubmitButton SubmitButton SubmitButton ] ), SightingForm=( [ (6) FormField ], FormField, SubmitButton ), SectorSearchForm=( (3) FormField, SubmitButton ), ?searches.length > 0: (n) SectorSearchRow ), ( ?companies.length === 0: EmptyState | (n) SectorCompanyRow )
```

### `/clients/patches/[patchId]/sightings`
`src/routes/clients/patches/[patchId]/sightings/+page.svelte`

```
PageTitle, ( ?sightings.length === 0: EmptyState | (n) SightingRow )
```

### `/clients/prospect`
`src/routes/clients/prospect/+page.svelte`

```
PageTitle, ( ?!data.isConfigured: FormErrorNote | ProspectSearchForm=( (2) FormField, SubmitButton ) ), ?companies !== null && companies…: EmptyState, ?companies !== null && companies…: ProspectResultTable=( [ (2) ( ProspectSeedFields, SubmitButton ) ] )
```

### `/clients/research`
`src/routes/clients/research/+page.svelte`

```
PageTitle, AskClaudeToResearch=( ?clientId === null: FormField, CopyTextButton )
```

### `/company`
`src/routes/company/+page.svelte`

```
LegalArticle
```

### `/contact`
`src/routes/contact/+page.svelte`

```
PageMeta, ( ?isSent: DiscoveryCallThankYou, ?!isSent: DiscoveryCallForm=( [ (6) FormField ], FormField, FormErrorNote, SubmitButton ) )
```

### `/demo`
`src/routes/demo/+page.svelte`

```
PageMeta, DemoStartSection=( (n) DemoKindChoiceCard=( SubmitButton ), FormErrorNote )
```

### `/demo/[token]`
`src/routes/demo/[token]/+page.svelte`

```
PageMeta, DemoConnectSection=( CopyTextButton ), DemoQuestionsSection, DemoMoneySection, DemoLinkedSystemsSection=( (n) DemoLinkedSystemRow ), DemoBrainSection, DemoActivitySection=( (n) DemoActivityRow, SubmitButton ), DemoOwnSystemSection
```

### `/leads`
`src/routes/leads/+page.svelte`

```
SalesRegisterPage=( WorkspaceHeader, RegisterStageTabs=( TabStrip ), FormErrorNote, ( ?clients.length === 0: EmptyState | ClientTable=( (n) ClientRow=( ClientStageForm ) ) ) ){ AddLeadForm=( ( ?leadKind === leadKinds.person: AddPersonForm=( SubmitButton ) | SubmitButton ) ) }
```

### `/notifications`
`src/routes/notifications/+page.svelte`

```
[ PageTitle ?hasUnread: MarkAllReadForm=( SubmitButton ) ], (n) NotificationRow=( SubmitButton )
```

### `/oauth/authorize`
`src/routes/oauth/authorize/+page.svelte`

```
PageTitle, [ (2) SubmitButton ]
```

### `/offer`
`src/routes/offer/+page.svelte`

```
PageMeta, OfferStepsSection=( (n) OfferStepCard=( ?step.isMonthlyRetainer: SignalBadge ), DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) ), OfferTermsSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) ), DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/organisations`
`src/routes/organisations/+page.svelte`

```
OrganisationsPageHeader=( WorkspaceHeader ){ FlashMessage, ( ?organisations.length === 0: EmptyState | OrganisationRegister=( (n) OrganisationRow ) ), Modal{ NewOrganisationForm=( OrganisationDetailsFields=( FormField, (n) OrganisationDetailInput=( FormField ) ), FormErrorNote, SubmitButton ) } }
```

### `/organisations/[organisationId]`
`src/routes/organisations/[organisationId]/+page.svelte`

```
WorkspaceHeader, FlashMessage, OrganisationOverviewTabs=( TabStrip, ( ?shownTab === organisationOvervi…: OrganisationPeoplePanel=( ?canManage: Button, DashboardPanel{ RecordsTable{ OrganisationMemberCells=( RecordsCell{ PersonLine }, RecordsCell{ Badge }, RecordsCell, ?canManage: RecordsCell{ Button }, Button ) } }, Modal{ InviteMemberForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, ?memberAwaitingRemoval !== null: DangerConfirmModal=( DangerConfirmForm ) ) | ?shownTab === organisationOvervi…: OrganisationDetailsPanel=( ?canManage: Button, (n) DashboardPanel{ OrganisationDetailList }, Modal{ OrganisationDetailsForm=( OrganisationDetailsFields, FormErrorNote, SubmitButton ) } ) | ?shownTab === organisationOvervi…: OrganisationModulesPanel=( DashboardPanel{ RecordsTable{ OrganisationModuleCells=( RecordsCell, RecordsCell{ Badge }, ?canSwitch: RecordsCell{ Button } ) } } ) | ?shownTab === organisationOvervi…: OrganisationDirectorsPanel=( ?canNameAnother: Button, DashboardPanel{ RecordsTable{ OrganisationDirectorCells=( RecordsCell{ PersonLine }, RecordsCell, ?canName: RecordsCell{ ?director.accountId !== null: Button } ) } }, Modal{ NameDirectorForm=( FormField, FormErrorNote, SubmitButton ) } ) ) ), DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) )
```

### `/organisations/[organisationId]/boardroom`
`src/routes/organisations/[organisationId]/boardroom/+page.svelte`

```
WorkspaceHeader, DashboardPanel{ BoardMeetingsTable=( RecordsTable{ MeetingStageBadge=( Badge ) } ) }, CallMeetingPanel=( DashboardPanel{ [ (2) FormField ], FormField, (n) AgendaItemFields=( FormField, [ FormField ?canRemove: Button ] ), [ (2) Button ] } )
```

### `/organisations/[organisationId]/boardroom/[meetingId]`
`src/routes/organisations/[organisationId]/boardroom/[meetingId]/+page.svelte`

```
WorkspaceHeader{ MeetingStageBadge=( Badge ) }, ?minutes.isClosed: MeetingMinutesPanel=( DashboardPanel{ ?minutes.latestVersion !== null: Badge, CopyTextButton, ?minutes.canAnswer && minutes.la…: MinutesAnswerForm=( FormField, [ (2) Button ] ), (n) MinutesVersionEntry=( ?answers.length > 0: (n) MinutesAnswerEntry=( DirectorAnswerEntry ) ) } ), MeetingAgendaPanel=( DashboardPanel{ (n) AgendaItemEntry=( [ Badge ?item.isAnyOtherBusiness: Badge ], ?papers.length > 0: (n) BoardPaperEntry, AgendaItemBriefing=( ?ownBrief !== null: OwnBriefSummary, ?briefing.canBrief: BoardBriefForm ), ItemRoomTalk=( ?badge !== null: Badge, ?said.length > 0: (n) BoardContributionEntry ), ?item.held !== null: HeldPieceCard=( [ (2) Button ] ), ?item.decision !== null: ItemDecision=( Badge, ?answers.length > 0: (n) DecisionAnswerEntry, ?decision.canAnswer: DecisionAnswerForm ), ItemActions=( ?entries.length > 0 || actions.c…: ( ?entries.length > 0: (n) BoardActionEntry, ?actions.canRaiseAgain: Button ), ?actions.canRecord: BoardActionForm ) ), ?withdrawnTitles.length > 0: WithdrawnAgendaItems } ), ?close.canClose: MeetingClosePanel=( DashboardPanel{ Button } ), ?meeting.ownClaude !== null: OwnClaudePanel=( DashboardPanel{ [ Badge ?ownClaude.isAskingFirst: Badge ], ?ownClaude.canChange: ( [ (2) SeatSettingForm=( Button ) ], SteerNoteForm=( FormField, Button ) ), SteerNotesList } ), MeetingFactsPanel=( DashboardPanel )
```

### `/organisations/[organisationId]/books`
`src/routes/organisations/[organisationId]/books/+page.svelte`

```
WorkspaceHeader, ?tabs.length > 0: TabStrip, BooksPeriodForm=( Button ), DashboardPanel{ ?shownStatement !== undefined: StatementTable=( RecordsTable{ RecordsCell, StatementFigureCell=( RecordsCell ) } ) }
```

### `/organisations/[organisationId]/books/accounts/[accountCode]`
`src/routes/organisations/[organisationId]/books/accounts/[accountCode]/+page.svelte`

```
WorkspaceHeader, DashboardPanel{ AccountEntriesTable=( RecordsTable{ (3) RecordsCell, (3) StatementFigureCell=( RecordsCell ), (5) RecordsCell, StatementFigureCell=( RecordsCell ) } ) }
```

### `/organisations/[organisationId]/brand`
`src/routes/organisations/[organisationId]/brand/+page.svelte`

```
WorkspaceHeader{ (2) Button }, DashboardPanel{ BrandAwaitingTable=( RecordsTable{ (3) RecordsCell } ) }, DashboardPanel{ BrandSwatches=( BrandDecisionNote ) }, (2) DashboardPanel{ BrandKitList=( BrandDecisionNote ) }, DashboardPanel{ BrandChannelTable=( RecordsTable{ (5) RecordsCell } ) }, DashboardPanel{ BrandCampaignTable=( RecordsTable{ (4) RecordsCell } ) }, (4) DashboardPanel{ BrandKitList=( BrandDecisionNote ) }
```

### `/organisations/[organisationId]/brand/campaigns/[campaignId]`
`src/routes/organisations/[organisationId]/brand/campaigns/[campaignId]/+page.svelte`

```
PrintOnPaper{ WorkspaceHeader{ Button }, DashboardPanel{ CampaignFigureTiles=( [ (6) StatTile ] ) }, DashboardPanel{ [ (2) CampaignAudienceTable=( RecordsTable{ (4) RecordsCell } ) ] } }
```

### `/organisations/[organisationId]/brand/content/[contentPieceId]`
`src/routes/organisations/[organisationId]/brand/content/[contentPieceId]/+page.svelte`

```
WorkspaceHeader{ ContentStageBadge=( Badge ) }, DashboardPanel{ ContentPieceText }, DashboardPanel{ ContentPostChannelTable=( RecordsTable{ ?row.isThisPiece: RecordsCell, Badge, RecordsCell, RecordsCell{ ContentStageBadge=( Badge ) }, RecordsCell } ) }, DashboardPanel{ ContentStoryboardTable=( RecordsTable{ (4) RecordsCell } ) }, DashboardPanel{ ContentPostPictures=( ?badge !== null: Badge, (n) [ LibraryPreview Badge ] ) }, ContentReviewPanel=( DashboardPanel{ ?isAwaitingApproval: ContentReviewForm=( FormField, FormErrorNote, [ (2) Button ] ) } ), DashboardPanel{ ContentReviewList }
```

### `/organisations/[organisationId]/brand/library`
`src/routes/organisations/[organisationId]/brand/library/+page.svelte`

```
WorkspaceHeader, DashboardPanel{ BrandLibraryTable=( RecordsTable{ RecordsCell{ LibraryPreview }, (2) RecordsCell, RecordsCell{ Badge }, RecordsCell } ) }, DashboardPanel{ ?hasBrand: BrandLibraryForm=( (3) FormField, ?isPermissionGiven: FormField, FormErrorNote, Button ) }
```

### `/organisations/[organisationId]/brand/plan`
`src/routes/organisations/[organisationId]/brand/plan/+page.svelte`

```
WorkspaceHeader{ (2) Button }, ?isAnyAwaitingApproval: DashboardPanel{ ContentPlanApproveForm=( FormErrorNote, Button ), ContentPlanApprovalTable=( RecordsTable{ (3) RecordsCell, RecordsCell{ ContentPlanApprovalChannels }, RecordsCell{ ContentPlanApprovalPicture=( (n) LibraryPreview ) } } ) }, DashboardPanel{ ContentPlanCounts=( [ (5) StatTile ] ) }, DashboardPanel{ ContentPlanRhythmTable=( RecordsTable{ (4) RecordsCell } ) }, DashboardPanel{ ContentPlanKindTable=( RecordsTable{ (2) RecordsCell } ) }, (n) ( ContentPlanWeekTallies=( (n) ( Badge, ?tally.extra !== noneExtra: Badge ) ), DashboardPanel{ ContentPlanWeekTable=( RecordsTable{ RecordsCell, ?row.post === null: RecordsCell, (2) RecordsCell, ( ?row.dueFor === null: RecordsCell | RecordsCell{ Badge } ), (4) RecordsCell, ( RecordsCell, RecordsCell{ ContentPlanChannelLinks }, (3) RecordsCell, RecordsCell{ ContentPlanPictureCell=( Badge ) }, RecordsCell{ ContentPlanChannelStages=( (n) ( ContentStageBadge=( Badge ), ?channel.isExtra: Badge ) ) }, RecordsCell{ ContentPlanChannelMoves=( (n) ?channel.canMove: Button ) } ) } ) } ), ContentPlanMoveModal=( Modal{ ?entry !== null: ( (2) FormField, FormErrorNote, [ (2) Button ] ) } )
```

### `/organisations/[organisationId]/business-brain`
`src/routes/organisations/[organisationId]/business-brain/+page.svelte`

```
WorkspaceHeader, BusinessBrainIndexPanel=( DashboardPanel{ RecordsTable{ RecordsCell, RecordsCell{ Badge }, (2) RecordsCell } } ), BusinessBrainChatbotsPanel=( DashboardPanel{ (n) BusinessBrainChatbotRow=( (n) Badge ) } ), ?hasUnnamedFiles: BusinessBrainFilesPanel=( DashboardPanel{ (n) BusinessBrainFileRow } )
```

### `/organisations/[organisationId]/business-brain/chatbots/[chatbotId=uuid]/questions`
`src/routes/organisations/[organisationId]/business-brain/chatbots/[chatbotId=uuid]/questions/+page.svelte`

```
WorkspaceHeader, DashboardPanel{ ChatbotQuestionsFilterForm=( (3) FormField, [ (3) Button ] ), (n) ChatbotQuestionEntry=( ?question.readings as reading, r…: ChatbotReadingLine, ChatbotAnswerReported ) }
```

### `/organisations/[organisationId]/business-brain/pages/[pageId=uuid]`
`src/routes/organisations/[organisationId]/business-brain/pages/[pageId=uuid]/+page.svelte`

```
WorkspaceHeader{ Badge }, BusinessBrainPageText=( DashboardPanel{ ProseText } ), BusinessBrainSourcePanel=( DashboardPanel ), BusinessBrainFilesPanel=( DashboardPanel{ (n) BusinessBrainFileRow } ), BusinessBrainHistoryPanel=( DashboardPanel ), BusinessBrainLinksPanel=( DashboardPanel )
```

### `/organisations/[organisationId]/domain`
`src/routes/organisations/[organisationId]/domain/+page.svelte`

```
WorkspaceHeader, ( ?brains === null: EmptyState | ( ( ?domain === null: EmptyState | ( DomainExplorer=( DomainMap=( (n) DomainContextBox, (n) DomainRelationshipLine, (n) DomainEntityNode ), ( ?chosenEntity === undefined: EmptyState | EntityPanel=( DashboardPanel{ ?isOfAProject: RaiseChangeButton=( RaiseChangeModal ), EntityPlacement=( EntityLink ), EntityFieldList=( (n) EntityFieldRow ), ?relationships.length > 0: EntityRelationshipList=( EntityLink ), ?projectId !== null && screens.l…: EntityScreenLinks } ) ) ), DomainContextsPanel=( DashboardPanel{ (n) DomainContextRow=( ?context.isCoreDomain: Badge ) } ) ) ), BusinessBrainChatbotsPanel=( DashboardPanel{ (n) BusinessBrainChatbotRow=( (n) Badge ) } ) ) )
```

### `/organisations/[organisationId]/sales`
`src/routes/organisations/[organisationId]/sales/+page.svelte`

```
WorkspaceHeader, DashboardPanel{ SalesPagesTable=( RecordsTable{ (2) RecordsCell } ) }
```

### `/organisations/[organisationId]/task-management`
`src/routes/organisations/[organisationId]/task-management/+page.svelte`

```
WorkspaceHeader, TabStrip, DashboardPanel{ TeamWorkTable=( RecordsTable{ (3) RecordsCell, RecordsCell{ Badge }, RecordsCell } ) }
```

### `/people`
`src/routes/people/+page.svelte`

```
PageTitle, FormErrorNote, AddPersonForm=( SubmitButton ), ?data.isCompaniesHouseConfigured: OfficerSearchForm=( SubmitButton ), ?officers !== null && officers.l…: EmptyState, ?officers !== null && officers.l…: OfficerResultList=( SubmitButton ), ( ?people.length === 0: EmptyState | PeopleTable=( (n) PersonRow=( PersonInitials ) ) )
```

### `/people/[personId]`
`src/routes/people/[personId]/+page.svelte`

```
PersonHeader=( PageTitle, PersonFacts=( WarmthPill ) ){ FormErrorNote, PersonLinkList=( (n) PersonLinkChip, SubmitButton ), ?data.pendingAppointments !== nu…: AppointmentImportForm=( ?appointments.length > 0: [ FormField SubmitButton ] ), PersonCompanyList=( (n) PersonCompanyCard=( StagePill, ?company.parentName === '': GroupUnderForm=( SubmitButton ) ) ), PersonNoteTimeline=( ProseText, SubmitButton ), PersonEventLedger }, Modal{ PersonFieldsForm=( [ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields=( (5) FormField ) ], SubmitButton ) }, Modal{ AskClaudeToDraftApproach=( CopyTextButton ) }, Modal{ AskClaudeToResearchPerson=( CopyTextButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) )
```

### `/portal`
`src/routes/portal/+page.svelte`

```
WorkspaceHeader{ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalProjectList=( DashboardPanel{ ?projects.length > 0: (n) PortalProjectRow=( [ PortalEnvironmentLink ProjectStatusBadge=( Badge ) ], (n) PortalGoalRow=( ProgressTrack ) ) } ), DashboardPanel{ PortalVisitorCard=( PersonInitials ) }
```

### `/portal/billing`
`src/routes/portal/billing/+page.svelte`

```
WorkspaceHeader, FlashMessage, ?invoices.length === 0: EmptyState, (n) BilledInvoicePanel=( DashboardPanel{ Badge, ?canPay: Button, BilledLinesTable=( RecordsTable{ (8) RecordsCell } ) } )
```

### `/portal/connect`
`src/routes/portal/connect/+page.svelte`

```
WorkspaceHeader, PortalConnectorAddress=( DashboardPanel{ CopyTextButton } ), PortalClaudeAbilities=( DashboardPanel ), PortalClaudePlanSteps=( DashboardPanel{ (n) PortalClaudePlanRow } ), PortalContextPrompt=( DashboardPanel{ CopyTextButton } )
```

### `/portal/context`
`src/routes/portal/context/+page.svelte`

```
WorkspaceHeader, ( ?data.reading === null: EmptyState | CompanyContextView=( CompanyContextMap=( (n) ContextAreaRegion, (n) ContextLinkLine, (n) ContextPartNode ), ( ?selectedPart === undefined: EmptyState | ContextPartPanel=( DashboardPanel{ ?steps.length > 0: ContextProcessStepList=( ?step.roleKey !== null: EntityLink ), ContextPartLinkList=( (2) EntityLink ), ?canMark: ContextPartReviewForm=( ?isNotRight: FormField, FormErrorNote, SubmitButton ) } ) ), ContextConfirmationPanel=( DashboardPanel{ ?isOpen: ContextConfirmForm=( FormErrorNote, SubmitButton ) } ), ?changes !== null: ContextChangesPanel=( DashboardPanel{ ?hasChanges(changes): (2) ContextChangeList=( (n) EntityLink ) } ) ) )
```

### `/portal/people`
`src/routes/portal/people/+page.svelte`

```
WorkspaceHeader{ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalPeopleList=( DashboardPanel{ (n) PortalPersonRow=( ?canManage: PortalPersonActions=( SubmitButton, FormErrorNote, DangerConfirmModal ) ) } ), ?visitor.isAdministrator: PortalInviteForm=( DashboardPanel{ (3) SmallCapsField=( FormField ), FormErrorNote, SubmitButton } )
```

### `/portal/projects/[projectId]`
`src/routes/portal/projects/[projectId]/+page.svelte`

```
WorkspaceHeader{ ProjectStatusBadge=( Badge ), HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalTaskList=( DashboardPanel{ ?tasks.length > 0: (n) PortalTaskRow } ), PortalGoalList=( DashboardPanel{ ?goals.length > 0: (n) PortalGoalRow=( ProgressTrack ) } ), PortalRequestForm=( DashboardPanel{ (3) SmallCapsField=( FormField ), FormErrorNote, SubmitButton } ), PortalRequestList=( DashboardPanel{ ?requests.length > 0: (n) PortalRequestRow=( ?!request.isDone: PortalRequestReplyForm=( FormErrorNote, SubmitButton ) ) } )
```

### `/privacy`
`src/routes/privacy/+page.svelte`

```
LegalArticle
```

### `/projects`
`src/routes/projects/+page.svelte`

```
ProjectsPageHeader=( WorkspaceHeader ){ FlashMessage, ProjectBoard=( ProjectsTabs=( TabStrip ), ( ?shownTab === priorityTasksTab: WaitingOnYouList=( (n) WaitingTaskRow ) | ( ProjectFilterBar=( FinishedProjectsToggle ), ( ProjectTable=( ProjectTableHeader, (n) ProjectRow=( ProjectTaskTally, ProjectPriorityCell{ ProjectNameLink, ProjectStatusBadge, ProjectOwnerCell, ProjectOrganisationCell, KitVersionBadge, ProjectStatusBadge, ?project.taskCount > 0: CompletionBar, ?project.isYours: ProjectActionsMenu } ) ), ProjectPagination ) ) ) ), Modal{ NewProjectForm=( (3) SmallCapsField=( FormField ), OrganisationSelect=( ?organisations.length > 0: SmallCapsField=( FormField ) ), TeamProjectField, FormErrorNote, SubmitButton ) }, ?selectedProject !== null: ProjectEditModals=( Modal{ EditProjectForm=( (2) SmallCapsField=( FormField ), [ SmallCapsField=( FormField ) ProjectPositionField=( PriorityField ) ], OrganisationSelect=( ?organisations.length > 0: SmallCapsField ), TeamProjectField, (2) SmallCapsField=( FormField ), [ (3) SmallCapsField=( FormField ) ], ProjectDatabaseFields=( [ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ] ), FormErrorNote, SubmitButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ), PriorityModal=( Modal{ PriorityField, FormErrorNote, SubmitButton } ) }
```

### `/projects/[projectId]`
`src/routes/projects/[projectId]/+page.svelte`

```
ProjectDetailHeader=( ProjectPageHeader=( TabStrip, WorkspaceHeader{ ProjectStatusBadge=( Badge ) } ){ ( ?isInternalProject: InternalProjectBadge=( Badge ) | KitVersionBadge=( ?standing !== kitStandings.noRep…: Badge ) ), ProjectHeaderMenu=( ActionsMenu ){ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } }, Modal{ EditProjectForm=( (2) SmallCapsField=( FormField ), [ SmallCapsField=( FormField ) ProjectPositionField=( PriorityField ) ], OrganisationSelect=( ?organisations.length > 0: SmallCapsField ), TeamProjectField, (2) SmallCapsField=( FormField ), [ (3) SmallCapsField=( FormField ) ], ProjectDatabaseFields=( [ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ] ), FormErrorNote, SubmitButton ) } ), ?isDevelopmentSide: DevelopmentTabs=( TabStrip ), FlashMessage, ProjectDashboard=( ?isBuiltWork: ProjectStatePanel=( DashboardPanel{ ?goals.length > 0: (n) GoalProgressLine=( ProgressTrack ) } ), ProjectPulseStrip=( [ (4) StatTile ] ), PanelTabs=( TabStrip ), ( ?isBuiltWork: TaskTreePanel=( DashboardPanel{ BacklogFilterBar=( CountedFilterChip{ AssigneeFilterChips{ ?isDoneFilterShown: DoneTaskFilter } } ), TaskGroupSections=( (n) TaskGroupSection ) }, ?longTermGroups.length > 0: DashboardPanel{ TaskGroupSections=( (n) TaskGroupSection ) } ) | InternalWorkBoard=( TabStrip, DashboardPanel{ BacklogFilterBar=( CountedFilterChip{ AssigneeFilterChips{ ?isDoneFilterShown: DoneTaskFilter } } ), ( ?isTableShown: InternalWorkTable=( (n) InternalWorkGroupTable ) | ?chosenView.key === internalWork…: InternalStatusBoard=( [ (n) Badge ?column.items as item (item.id): StatusBoardCard ] ) | InternalWorkCalendar=( CalendarNavigation{ CalendarGrid }, UndatedEntries ) ) } ) ), (2) GoalListPanel=( DashboardPanel{ GoalStatusFilter, GoalList=( (n) GoalRow ) }, Modal{ AddGoalForm=( (2) SmallCapsField, GoalHorizonField, FormErrorNote, SubmitButton ) }, ?priorityGoal !== null: PriorityModal=( Modal{ PriorityField, FormErrorNote, SubmitButton } ) ), ProjectPeoplePanel=( DashboardPanel{ (n) PersonRow=( PersonInitials ) }, Modal{ InvitePersonForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, Modal{ TransferOwnershipForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, ?personAwaitingRemoval !== null: DangerConfirmModal=( DangerConfirmForm ) ) ), ProjectNewTaskModal=( Modal{ ( ?isInternalSide: NewInternalTaskForm=( NewTaskFormShell=( NewTaskFormFooter ){ SmallCapsField=( FormField ), NewTaskDetailsField=( SmallCapsField ), TaskOwnerField=( SmallCapsField ), NewTaskDueDateField=( SmallCapsField ), TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), ?sequenceChoices.length > 0: TaskSequenceField=( SmallCapsField ) } ) | NewTaskForm=( NewTaskFormShell=( NewTaskFormFooter ){ SmallCapsField=( FormField ), NewTaskDetailsField=( SmallCapsField ), NewTaskDueDateField=( SmallCapsField ), ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), ?sequenceChoices.length > 0: TaskSequenceField=( SmallCapsField ) } ) ) } ), TaskRowModals=( ?statusTask !== null: TaskStatusModal=( Modal{ FormErrorNote, (n) TaskStatusOption } ), ?goalTask !== null: TaskGoalModal=( Modal{ FormErrorNote, (n) TaskGoalChoiceForm } ), ?priorityTask !== null: PriorityModal=( Modal{ PriorityField, FormErrorNote, SubmitButton } ), ?storyPointsTask !== null: TaskStoryPointsModal=( Modal{ FormErrorNote, (n) TaskStoryPointsOption } ), ?autocompleteTask !== null: TaskAutocompleteModal=( Modal{ FormErrorNote, (n) TaskAutocompleteOption } ) ), TaskSheet=( ?target !== null && href !== null: Sheet, ( ?taskData === null: BrandSpinner | TaskPage ) )
```

### `/projects/[projectId]/deploys`
`src/routes/projects/[projectId]/deploys/+page.svelte`

```
ProjectPageHeader=( TabStrip, WorkspaceHeader{ ProjectStatusBadge=( Badge ) } ), DevelopmentTabs=( TabStrip ), DashboardPanel{ DeployHistoryFilterBar=( (2) InlineField ), (n) DeployHistoryEntry }, ProjectPagination
```

### `/projects/[projectId]/domain`
`src/routes/projects/[projectId]/domain/+page.svelte`

```
BlueprintHeader=( ProjectPageHeader=( TabStrip, WorkspaceHeader{ ProjectStatusBadge=( Badge ) } ){ SubmitButton, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ), FlashMessage, ?productBrain !== null && addres…: BusinessBrainIndexPanel=( DashboardPanel{ RecordsTable{ RecordsCell, RecordsCell{ Badge }, (2) RecordsCell } } ), ( ?ownDomain !== null && addresses…: ( DomainExplorer=( DomainMap=( (n) DomainContextBox, (n) DomainRelationshipLine, (n) DomainEntityNode ), ( ?chosenEntity === undefined: EmptyState | EntityPanel=( DashboardPanel{ ?isOfAProject: RaiseChangeButton=( RaiseChangeModal ), EntityPlacement=( EntityLink ), EntityFieldList=( (n) EntityFieldRow ), ?relationships.length > 0: EntityRelationshipList=( EntityLink ), ?projectId !== null && screens.l…: EntityScreenLinks } ) ) ), DomainContextsPanel=( DashboardPanel{ (n) DomainContextRow=( ?context.isCoreDomain: Badge ) } ) ) | ?domain === null: EmptyState | DomainExplorer=( DomainMap=( (n) DomainContextBox, (n) DomainRelationshipLine, (n) DomainEntityNode ), ( ?chosenEntity === undefined: EmptyState | EntityPanel=( DashboardPanel{ ?isOfAProject: RaiseChangeButton=( RaiseChangeModal ), EntityPlacement=( EntityLink ), EntityFieldList=( (n) EntityFieldRow ), ?relationships.length > 0: EntityRelationshipList=( EntityLink ), ?projectId !== null && screens.l…: EntityScreenLinks } ) ) ) )
```

### `/projects/[projectId]/goals/[goalId]`
`src/routes/projects/[projectId]/goals/[goalId]/+page.svelte`

```
GoalDetailHeader=( WorkspaceHeader{ GoalStatusPill, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ){ FlashMessage, GoalMeasurePanel=( DashboardPanel{ ProseText } ), GoalAutocompletePanel=( DashboardPanel{ ?canSwitch: SubmitButton, FormErrorNote } ), GoalTaskList=( DashboardPanel{ TaskLinkList=( TaskKindPill ) } ), ConversationThread=( DashboardPanel{ ConversationBaton=( ?stations.length > 0: BatonTrack=( (n) BatonStationNode ) ), (n) MessageRow=( ProseText ), ConversationComposer=( FormErrorNote, [ HandOffPicker=( (2) FormField ) SubmitButton ] ) } ), LifecyclePanel=( DashboardPanel{ (n) LifecycleStepItem } ), ConversationParticipantsPanel=( DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm=( SubmitButton ) } ), Modal{ EditGoalForm=( (2) SmallCapsField=( FormField ), [ SmallCapsField=( FormField ) GoalHorizonField=( SmallCapsField=( FormField ) ) PriorityField ], FormErrorNote, SubmitButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) }
```

### `/projects/[projectId]/site-map`
`src/routes/projects/[projectId]/site-map/+page.svelte`

```
BlueprintHeader=( ProjectPageHeader=( TabStrip, WorkspaceHeader{ ProjectStatusBadge=( Badge ) } ){ SubmitButton, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ), DevelopmentTabs=( TabStrip ), FlashMessage, AudienceSwitch, ?mcpMap !== null: ParitySummary, ( ?audience === siteMapAudiences.c…: ( ?mcpMap === null: EmptyState, McpMapBrowser=( SectionCrates{ CoverAlbum{ McpEntryCover=( CoverSleeve{ McpEntryFace } ) }, ?chosenEntry !== undefined: McpEntryDetails=( DashboardPanel{ RaiseChangeButton=( RaiseChangeModal ), McpEntryFace, ( ?entry.kind === mcpEntryKinds.to…: ToolDoors=( (n) PairedScreenLink ) | GuideDetails ) } ) } ) ) | ?siteMap === null: EmptyState | SiteMapBrowser=( SectionCrates{ CoverAlbum{ ScreenCover=( CoverSleeve{ Wireframe=( WireframeNode ) } ) }, ?chosenScreen !== undefined: ScreenDetails=( DashboardPanel{ RaiseChangeButton=( RaiseChangeModal ), Wireframe=( WireframeNode ), ?mcpMap !== null: ScreenTools } ) } ) )
```

### `/projects/[projectId]/staged`
`src/routes/projects/[projectId]/staged/+page.svelte`

```
DeployNowButton, ProjectPageHeader=( TabStrip, WorkspaceHeader{ ProjectStatusBadge=( Badge ) } ), DevelopmentTabs=( TabStrip ), FlashMessage, StagedTasksPanel=( HeaderFacts=( ?facts.length > 0: (n) HeaderFact ), DashboardPanel{ (n) StagedTaskRow } )
```

### `/projects/[projectId]/tasks/[taskId]`
`src/routes/projects/[projectId]/tasks/[taskId]/+page.svelte`

```
TaskDetailHeader=( WorkspaceHeader{ TaskKindPill } ){ FlashMessage, TaskWaitingNote=( ?waitedFor !== null: TaskReferenceLink ), TaskStoryPanel=( DashboardPanel{ ?isSupportTask: SupportTaskFacts=( ?task.resolution !== '': ProseText ), ?task.details !== '': ProseText } ), ?isAwaitingResolution: ResolveSupportTaskForm=( FormErrorNote, SubmitButton ), AcceptanceCriteriaSection=( DashboardPanel{ (n) CriterionRow }, Modal{ SmallCapsField=( FormField ), FormErrorNote, SubmitButton } ), SubtaskList=( DashboardPanel{ TaskLinkList=( TaskKindPill ) } ){ TaskSequencePanel=( DashboardPanel{ SequenceTrack=( (n) SequenceStepNode=( (2) TaskReferenceLink ) ) } ), TaskTodosPanel=( ?todos.length > 0: DashboardPanel, TodoStatusForm ), ChecklistSection=( DashboardPanel{ (n) ChecklistPanel=( ?items.length > 0: (n) ChecklistItemRow, AddChecklistItemForm=( SubmitButton, FormErrorNote ), RenameChecklistModal=( Modal{ SmallCapsField, FormErrorNote, SubmitButton } ), DangerConfirmModal=( DangerConfirmForm ) ) }, Modal{ SmallCapsField=( FormField ), FormErrorNote, SubmitButton } ), TaskAttachmentsSection=( DashboardPanel{ (n) AttachmentRow=( AttachmentThumbnail=( ?isImage: ImageThumbnail ), ?canPreview: AttachmentPreviewModal=( Modal ), DangerConfirmModal=( DangerConfirmForm ) ), ?errorMessage !== null: FormErrorNote } ), ConversationThread=( DashboardPanel{ ConversationBaton=( ?stations.length > 0: BatonTrack=( (n) BatonStationNode ) ), (n) MessageRow=( ProseText ), ConversationComposer=( FormErrorNote, [ HandOffPicker=( (2) FormField ) SubmitButton ] ) } ) }, TaskAside=( TaskFactsPanel=( DashboardPanel{ ?task.dueDate !== null: TaskDueDate, TaskAutocompleteFact=( TaskAutocompleteModal ) } ), TaskComplexityPanel=( DashboardPanel{ [ (3) TaskComplexityCount=( FormField ) ], FormErrorNote, SubmitButton } ), TaskBranchPanel=( DashboardPanel{ TaskBranchLinks, ?isEditing: TaskBranchForm=( FormErrorNote, SubmitButton ) } ), LifecyclePanel=( DashboardPanel{ (n) LifecycleStepItem } ), ConversationParticipantsPanel=( DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm=( SubmitButton ) } ) ), TaskPageModals=( Modal{ TaskEditForm=( (2) SmallCapsField=( FormField ), TaskStatusAndDueFields=( [ (2) SmallCapsField ] ), TaskPlanningFields=( [ (2) SmallCapsField ] ), TaskSequenceField=( SmallCapsField ), PriorityField, TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), TaskDepartmentField=( SmallCapsField ), TaskMoveFields=( SmallCapsField, SmallCapsField ), UserStoryFields=( ?isUserStory: [ (3) FormField ] ), TeamPickerFieldset, FormErrorNote, SubmitButton ) }, Modal{ NewTaskForm=( NewTaskFormShell=( NewTaskFormFooter ){ SmallCapsField=( FormField ), NewTaskDetailsField=( SmallCapsField ), NewTaskDueDateField=( SmallCapsField ), ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), ?sequenceChoices.length > 0: TaskSequenceField=( SmallCapsField ) } ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ) }
```

### `/projects/autocomplete`
`src/routes/projects/autocomplete/+page.svelte`

```
WorkspaceHeader, AutocompleteRegisterFilter, ( ?register.length === 0: EmptyState | ?projectsShown.length === 0: EmptyState | (n) AutocompleteProjectPanel=( DashboardPanel{ (2) (n) AutocompleteRow } ) )
```

### `/projects/kit-versions`
`src/routes/projects/kit-versions/+page.svelte`

```
WorkspaceHeader, FlashMessage, DashboardPanel{ (n) KitVersionRow=( KitVersionBadge=( ?standing !== kitStandings.noRep…: Badge ) ) }
```

### `/promo`
`src/routes/promo/+page.svelte`

```
PageMeta, PromoPlayer=( PromoOverlay=( PromoCaptions=( (n) PromoCaptionHeadline ), ?!isReady: BrandSpinner, ?isWatching: ?clock.hasEnded: PromoEndCard=( DiscoveryCallButton, LineIcon ), LineIcon, PromoControls=( LineIcon, PromoChapterBar{ LineIcon } ) ) ), PromoIntro=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/tax-calculator`
`src/routes/tax-calculator/+page.svelte`

```
TakeHomePageHead=( PageMeta ), CalculatorSubNavigation, CalculatorHero=( HeroIllustration ), SectionHeading{ TaxYearSelect=( InlineField ) }, EarningsForm=( EarningTypeTiles=( EarningTypeIcon ), ?form.isEmployed: BigAmountField, ?form.isSelfEmployed: SelfEmploymentFields=( ( ?form.earningType === earningTyp…: BigAmountField | PeriodAmountField ), PeriodAmountField, ExpenseExamples=( DisclosureMarker ), ToggleSwitch{ ?isCisSubcontractor: PeriodAmountField } ), TaxRegionField=( FormField ), MoreAccurateOptions=( DisclosureMarker, PensionField=( FormField ), StudentLoanFields=( FormField ), ?form.isEmployed: PeriodAmountField, ?form.isSelfEmployed: MileageAndHomeFields=( [ (2) FormField ], ?form.vehicleType !== vehicleTyp…: PeriodAmountField ) ) ), TakeHomeEstimatePanel=( TakeHomePanel{ ?estimate: TakeHomeCard=( ResultPeriodToggle, ?!isLoss: ( TakeHomeDonut, SegmentLegend ), TakeHomeNote ), TakeHomeActions, EmptyTakeHome } ), ?estimate: ( BiggerPictureSection=( SectionHeading, [ WhatIfCard=( WidgetIcon ) LivingCostsCard=( WidgetIcon, FormField ) ] ), EveryPoundSection=( SectionHeading, [ BreakdownCard=( ?period === resultPeriods.quarte…: QuarterlyViewNote, BreakdownTable, BandsDisclosure=( DisclosureMarker, BreakdownTable, ?nationalInsurance.length > 0: BreakdownTable ), EstimateExclusions=( DisclosureMarker ) ) YearComparisonCard TradingRoutesCard=( TradingRouteTiles, CompanyPayFields=( [ (2) FormField ] ), ?company: CompanyWorkingDisclosure=( DisclosureMarker, BreakdownTable ), TradingRouteNotes=( DisclosureMarker ) ) ], ?isPayingHigherRates(estimate): HighIncomeNotice ), ?bill: SelfAssessmentSection=( SectionHeading, [ SelfAssessmentBillCard=( WidgetIcon, ?plan: PaymentTimeline, BreakdownTable ) ?paymentsOnAccount: PaymentsOnAccountCard=( WidgetIcon ) MakingTaxDigitalCard=( WidgetIcon, ?isInScope: QuarterlyDeadlines ) Class2Card=( WidgetIcon ) ] ), DeadlinesEmailCard=( WidgetIcon, ?isSent: DeadlinesEmailSent, ?!isSent: ( FormField, FormErrorNote, SubmitButton ) ) ), ComparisonsSection=( SectionHeading, (n) ComparisonCard=( ?comparison.tradingRoutes: SavedTradingRoutes ) ){ HowItWorksSection=( SectionHeading, PlainEnglishExplanations=( DisclosureMarker ), FigureSources ), ClosingStrip }, ?estimate: MobileTakeHomeBar
```

### `/terms`
`src/routes/terms/+page.svelte`

```
LegalArticle
```

### `/upload/[token]`
`src/routes/upload/[token]/+page.svelte`

```
?data.taskTitle === null: PageTitle, ( PageTitle, TaskUploadZone{ SentFileList } )
```

## Components of the site

| Component | Used by | Definition |
| --- | --- | --- |
| `SubmitButton` | 70 | — |
| `FormErrorNote` | 56 | — |
| `SmallCapsField` | 32 | `FormField` |
| `RecordsCell` | 25 | — |
| `DangerConfirmModal` | 11 | `DangerConfirmForm` |
| `FlashMessage` | 11 | — |
| `PageMeta` | 9 | — |
| `CopyTextButton` | 8 | — |
| `DiscoveryCallButton` | 8 | `?hasCalendarIcon: LineIcon, LineIcon` |
| `LineIcon` | 8 | — |
| `DisclosureMarker` | 7 | — |
| `HeaderFacts` | 7 | `?facts.length > 0: (n) HeaderFact` |
| `WidgetIcon` | 7 | — |
| `BrandWordmark` | 6 | — |
| `EntityLink` | 6 | — |
| `ProseText` | 6 | — |
| `SectionHeading` | 6 | — |
| `BrandSpinner` | 5 | — |
| `ChevronIcon` | 5 | — |
| `PersonInitials` | 5 | — |
| `PriorityField` | 5 | — |
| `StatTile` | 5 | — |
| `ActionsMenu` | 4 | — |
| `DevelopmentTabs` | 4 | `TabStrip` |
| `DiscoveryCallSection` | 4 | `DiscoveryCallButton` |
| `ProjectPageHeader` | 4 | `TabStrip, WorkspaceHeader{ ProjectStatusBadge }` |
| `ProjectStatusBadge` | 4 | `Badge` |
| `StagePill` | 4 | — |
| `ContentStageBadge` | 3 | `Badge` |
| `KitVersionBadge` | 3 | `?standing !== kitStandings.noRep…: Badge` |
| `LegalArticle` | 3 | — |
| `LibraryPreview` | 3 | — |
| `NewTaskForm` | 3 | `NewTaskFormShell{ SmallCapsField, NewTaskDetailsField, NewTaskDueDateField, ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields, ?sequenceChoices.length > 0: TaskSequenceField }` |
| `PeriodAmountField` | 3 | — |
| `PriorityControls` | 3 | `ArrowIcon` |
| `PriorityModal` | 3 | `Modal{ PriorityField, FormErrorNote, SubmitButton }` |
| `PriorityNumberButton` | 3 | — |
| `ProgressTrack` | 3 | — |
| `RaiseChangeButton` | 3 | `RaiseChangeModal` |
| `StatusSelect` | 3 | — |
| `TaskDueDate` | 3 | — |
| `TaskGoalAndKindFields` | 3 | `[ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ]` |
| `TaskKindPill` | 3 | — |
| `TaskReferenceLink` | 3 | — |
| `TaskSequenceField` | 3 | `SmallCapsField` |
| `AccountMenu` | 2 | `(n) AccountMenuGroup` |
| `AddPersonForm` | 2 | `SubmitButton` |
| `AreaCompanyList` | 2 | `(n) AreaCompanyRow` |
| `AreaCompanyPanel` | 2 | `?isOneCompany: FindJobAdvertsButton, ( ?registerStanding !== null: RegisterStandingLink \| ?canBecomeLead: [ (2) ( ProspectSeedFields, SubmitButton ) ] )` |
| `AreaLegend` | 2 | — |
| `AskClaudeToDraftApproach` | 2 | `CopyTextButton` |
| `BacklogFilterBar` | 2 | `CountedFilterChip{ AssigneeFilterChips{ ?isDoneFilterShown: DoneTaskFilter } }` |
| `BigAmountField` | 2 | — |
| `BlueprintHeader` | 2 | `ProjectPageHeader{ SubmitButton, HeaderFacts }` |
| `BrandDecisionNote` | 2 | — |
| `BusinessBrainChatbotsPanel` | 2 | `DashboardPanel{ (n) BusinessBrainChatbotRow }` |
| `BusinessBrainFilesPanel` | 2 | `DashboardPanel{ (n) BusinessBrainFileRow }` |
| `BusinessBrainIndexPanel` | 2 | `DashboardPanel{ RecordsTable{ RecordsCell, RecordsCell{ Badge }, (2) RecordsCell } }` |
| `CalendarEntryLink` | 2 | — |
| `CompanyContextView` | 2 | `CompanyContextMap, ( ?selectedPart === undefined: EmptyState \| ContextPartPanel ), ContextConfirmationPanel, ?changes !== null: ContextChangesPanel` |
| `ConversationParticipantsPanel` | 2 | `DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm }` |
| `ConversationThread` | 2 | `DashboardPanel{ ConversationBaton, (n) MessageRow, ConversationComposer }` |
| `CountedFilterChip` | 2 | — |
| `CoverAlbum` | 2 | — |
| `CoverSleeve` | 2 | — |
| `DirectorAnswerEntry` | 2 | `Badge` |
| `DomainContextsPanel` | 2 | `DashboardPanel{ (n) DomainContextRow }` |
| `DomainExplorer` | 2 | `DomainMap, ( ?chosenEntity === undefined: EmptyState \| EntityPanel )` |
| `DueDateField` | 2 | — |
| `EditProjectForm` | 2 | `(2) SmallCapsField, [ SmallCapsField ProjectPositionField ], OrganisationSelect, TeamProjectField, (2) SmallCapsField, [ (3) SmallCapsField ], ProjectDatabaseFields, FormErrorNote, SubmitButton` |
| `FindJobAdvertsButton` | 2 | `Modal{ AskClaudeToFindJobAdverts }` |
| `FrameNavLink` | 2 | — |
| `FramePicker` | 2 | `LineIcon, ?isOpen: FramePickerList` |
| `GoalHorizonField` | 2 | `SmallCapsField` |
| `GoalStatusPill` | 2 | — |
| `GroupUnderForm` | 2 | `SubmitButton` |
| `InternalProjectBadge` | 2 | `Badge` |
| `LeadOutcomeNote` | 2 | `FormErrorNote` |
| `LifecyclePanel` | 2 | `DashboardPanel{ (n) LifecycleStepItem }` |
| `McpEntryFace` | 2 | — |
| `MeetingStageBadge` | 2 | `Badge` |
| `MobileMenuButton` | 2 | — |
| `NewTaskDetailsField` | 2 | `SmallCapsField` |
| `NewTaskDueDateField` | 2 | `SmallCapsField` |
| `NewTaskFormShell` | 2 | `NewTaskFormFooter` |
| `OfferStepCard` | 2 | `?step.isMonthlyRetainer: SignalBadge` |
| `OrganisationDetailsFields` | 2 | `FormField, (n) OrganisationDetailInput` |
| `OrganisationSelect` | 2 | `?organisations.length > 0: SmallCapsField` |
| `PersonFacts` | 2 | `WarmthPill` |
| `PersonFieldsForm` | 2 | `[ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields ], SubmitButton` |
| `PersonLine` | 2 | `PersonInitials` |
| `PersonLinkList` | 2 | `(n) PersonLinkChip, SubmitButton` |
| `PersonNoteTimeline` | 2 | `ProseText, SubmitButton` |
| `PersonRow` | 2 | `PersonInitials` |
| `PortalGoalRow` | 2 | `ProgressTrack` |
| `PortalLink` | 2 | `LineIcon` |
| `ProjectPagination` | 2 | — |
| `ProspectSeedFields` | 2 | — |
| `RegisterStandingLink` | 2 | `StagePill` |
| `SalesRegisterPage` | 2 | `WorkspaceHeader, RegisterStageTabs, FormErrorNote, ( ?clients.length === 0: EmptyState \| ClientTable )` |
| `SectionCrates` | 2 | — |
| `SectorPanel` | 2 | `SectorClaimForms, SightingForm, SectorSearchForm, ?searches.length > 0: (n) SectorSearchRow` |
| `SignalBadge` | 2 | — |
| `StatementFigureCell` | 2 | `RecordsCell` |
| `TaskAutocompleteModal` | 2 | `Modal{ FormErrorNote, (n) TaskAutocompleteOption }` |
| `TaskLinkList` | 2 | `TaskKindPill` |
| `TaskListRow` | 2 | `TaskCardHandle{ TaskRowTitle{ TaskCardActions } }, TaskCardFacts, TaskCardFooter, ?isOpen: SubtaskRows` |
| `TeamMemberProfile` | 2 | — |
| `TeamProjectField` | 2 | — |
| `WarmthPill` | 2 | — |
| `Wireframe` | 2 | `WireframeNode` |
| `AboutStorySection` | 1 | — |
| `AboutTeamSection` | 1 | `(n) TeamMemberProfile` |
| `AcceptanceCriteriaSection` | 1 | `DashboardPanel{ (n) CriterionRow }, Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `AccountEntriesTable` | 1 | `RecordsTable{ (3) RecordsCell, (3) StatementFigureCell, (5) RecordsCell, StatementFigureCell }` |
| `AccountMenuGroup` | 1 | — |
| `ActionPlaceFields` | 1 | `[ FormField ?hasProject: FormField ]` |
| `AddChecklistItemForm` | 1 | `SubmitButton, FormErrorNote` |
| `AddGoalForm` | 1 | `(2) SmallCapsField, GoalHorizonField, FormErrorNote, SubmitButton` |
| `AddLeadForm` | 1 | `( ?leadKind === leadKinds.person: AddPersonForm \| SubmitButton )` |
| `AddParticipantForm` | 1 | `SubmitButton` |
| `AddTodoLine` | 1 | `Button` |
| `AdminActionsMenu` | 1 | `ActionsMenu{ (3) AdminMenuAction, ?!user.isAdmin: AdminMenuAction }, SetPasswordModal` |
| `AdminMenuAction` | 1 | — |
| `AdminUserRow` | 1 | `AdminActionsMenu` |
| `AgendaItemBriefing` | 1 | `?ownBrief !== null: OwnBriefSummary, ?briefing.canBrief: BoardBriefForm` |
| `AgendaItemEntry` | 1 | `[ Badge ?item.isAnyOtherBusiness: Badge ], ?papers.length > 0: (n) BoardPaperEntry, AgendaItemBriefing, ItemRoomTalk, ?item.held !== null: HeldPieceCard, ?item.decision !== null: ItemDecision, ItemActions` |
| `AgendaItemFields` | 1 | `FormField, [ FormField ?canRemove: Button ]` |
| `AppMockup` | 1 | `AppMockupSidebar, AppMockupTiles, AppMockupCashChart, AppMockupDecisions, AppMockupOrders` |
| `AppMockupCashChart` | 1 | — |
| `AppMockupDecisions` | 1 | — |
| `AppMockupOrders` | 1 | — |
| `AppMockupSidebar` | 1 | — |
| `AppMockupTiles` | 1 | — |
| `AppointmentImportForm` | 1 | `?appointments.length > 0: [ FormField SubmitButton ]` |
| `AreaCompanyRow` | 1 | `?standing !== null: StagePill` |
| `AreaEventPill` | 1 | — |
| `AreaEventRow` | 1 | `AreaEventPill` |
| `AreaFeedHeader` | 1 | `[ PageTitle LiveMarker ], (2) FeedScopeChips` |
| `AreaFeedScoreboard` | 1 | `[ (4) StatTile ]` |
| `AreaMap` | 1 | — |
| `AreaMapPane` | 1 | `AreaMap, AreaLegend` |
| `AreaMapWorkspace` | 1 | `AreaMapPane{ AreaCompanyPanel, AreaCompanyList }` |
| `AreaSearchForm` | 1 | `(3) FormField, SubmitButton` |
| `AreaSummary` | 1 | — |
| `ArrowIcon` | 1 | — |
| `AskClaudeToFindJobAdverts` | 1 | `CopyTextButton` |
| `AskClaudeToResearch` | 1 | `?clientId === null: FormField, CopyTextButton` |
| `AskClaudeToResearchPerson` | 1 | `CopyTextButton` |
| `AssignProjectForm` | 1 | `FormField, (2) FormField, SubmitButton` |
| `AssignedToYouNote` | 1 | — |
| `AssigneeFilterChips` | 1 | `(n) CountedFilterChip` |
| `AssigneePills` | 1 | — |
| `AssistantActionChips` | 1 | — |
| `AssistantBubble` | 1 | `AssistantActionChips` |
| `AssistantPhoneMockup` | 1 | `(n) AssistantBubble` |
| `AttachmentPreviewModal` | 1 | `Modal` |
| `AttachmentRow` | 1 | `AttachmentThumbnail, ?canPreview: AttachmentPreviewModal, DangerConfirmModal` |
| `AttachmentThumbnail` | 1 | `?isImage: ImageThumbnail` |
| `AudienceSwitch` | 1 | — |
| `AutocompleteProjectPanel` | 1 | `DashboardPanel{ (2) (n) AutocompleteRow }` |
| `AutocompleteRegisterFilter` | 1 | — |
| `AutocompleteRow` | 1 | — |
| `BandsDisclosure` | 1 | `DisclosureMarker, BreakdownTable, ?nationalInsurance.length > 0: BreakdownTable` |
| `BatonStationNode` | 1 | — |
| `BatonTrack` | 1 | `(n) BatonStationNode` |
| `BeforeFirstUseNote` | 1 | — |
| `BiggerPictureSection` | 1 | `SectionHeading, [ WhatIfCard LivingCostsCard ]` |
| `BilledInvoicePanel` | 1 | `DashboardPanel{ Badge, ?canPay: Button, BilledLinesTable }` |
| `BilledLinesTable` | 1 | `RecordsTable{ (8) RecordsCell }` |
| `BoardActionEntry` | 1 | `Badge` |
| `BoardActionForm` | 1 | `FormField, [ (2) FormField ], ActionPlaceFields, Button` |
| `BoardBriefForm` | 1 | `(n) FormField, Button` |
| `BoardContributionEntry` | 1 | — |
| `BoardMeetingsTable` | 1 | `RecordsTable{ MeetingStageBadge }` |
| `BoardPaperEntry` | 1 | — |
| `BooksPeriodForm` | 1 | `Button` |
| `BrandAwaitingTable` | 1 | `RecordsTable{ (3) RecordsCell }` |
| `BrandCampaignTable` | 1 | `RecordsTable{ (4) RecordsCell }` |
| `BrandChannelTable` | 1 | `RecordsTable{ (5) RecordsCell }` |
| `BrandKitList` | 1 | `BrandDecisionNote` |
| `BrandLibraryForm` | 1 | `(3) FormField, ?isPermissionGiven: FormField, FormErrorNote, Button` |
| `BrandLibraryTable` | 1 | `RecordsTable{ RecordsCell{ LibraryPreview }, (2) RecordsCell, RecordsCell{ Badge }, RecordsCell }` |
| `BrandSwatches` | 1 | `BrandDecisionNote` |
| `BreakdownCard` | 1 | `?period === resultPeriods.quarte…: QuarterlyViewNote, BreakdownTable, BandsDisclosure, EstimateExclusions` |
| `BuildModelRow` | 1 | `[ (2) PointsSelect SubmitButton ], FormErrorNote` |
| `BuildModelsPanel` | 1 | `ReviewModelForm, (n) BuildModelRow, BuildModelRow` |
| `BuildingPanel` | 1 | — |
| `BuiltForSection` | 1 | `(n) ClientBusinessCard` |
| `BusinessAppSection` | 1 | `HeroChecklist, DiscoveryCallButton, (n) HeroPromiseRow, HeroMockup` |
| `BusinessBrainChatbotRow` | 1 | `(n) Badge` |
| `BusinessBrainFileRow` | 1 | — |
| `BusinessBrainHistoryPanel` | 1 | `DashboardPanel` |
| `BusinessBrainLinksPanel` | 1 | `DashboardPanel` |
| `BusinessBrainPageText` | 1 | `DashboardPanel{ ProseText }` |
| `BusinessBrainSourcePanel` | 1 | `DashboardPanel` |
| `CalculatorHero` | 1 | `HeroIllustration` |
| `CalculatorSubNavigation` | 1 | — |
| `CalendarDayCell` | 1 | `(n) CalendarEntryLink` |
| `CalendarGrid` | 1 | `(n) CalendarDayCell` |
| `CalendarNavigation` | 1 | `[ (3) Button ]` |
| `CallMeetingPanel` | 1 | `DashboardPanel{ [ (2) FormField ], FormField, (n) AgendaItemFields, [ (2) Button ] }` |
| `CampaignAudienceTable` | 1 | `RecordsTable{ (4) RecordsCell }` |
| `CampaignFigureTiles` | 1 | `[ (6) StatTile ]` |
| `CaseStudyBusinessSection` | 1 | `CaseStudyOutcomes` |
| `CaseStudyIntroSection` | 1 | — |
| `CaseStudyMethodSection` | 1 | — |
| `CaseStudyOutcomes` | 1 | — |
| `ChatbotAnswerReported` | 1 | — |
| `ChatbotQuestionEntry` | 1 | `?question.readings as reading, r…: ChatbotReadingLine, ChatbotAnswerReported` |
| `ChatbotQuestionsFilterForm` | 1 | `(3) FormField, [ (3) Button ]` |
| `ChatbotReadingLine` | 1 | — |
| `ChecklistItemRow` | 1 | — |
| `ChecklistPanel` | 1 | `?items.length > 0: (n) ChecklistItemRow, AddChecklistItemForm, RenameChecklistModal, DangerConfirmModal` |
| `ChecklistSection` | 1 | `DashboardPanel{ (n) ChecklistPanel }, Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `Class2Card` | 1 | `WidgetIcon` |
| `ClientBusinessCard` | 1 | — |
| `ClientContinuityCopySection` | 1 | `[ (3) FormField ], SubmitButton` |
| `ClientDeletion` | 1 | `DangerConfirmModal` |
| `ClientDocumentList` | 1 | `(n) ClientDocumentRow` |
| `ClientDocumentRow` | 1 | — |
| `ClientEventLedger` | 1 | — |
| `ClientGroupSection` | 1 | `?children.length > 0: StagePill, ?children.length === 0 && parent…: GroupUnderForm` |
| `ClientHeader` | 1 | `PageTitle` |
| `ClientObservations` | 1 | `?observations.length > 0: (n) ObservationRow` |
| `ClientPeopleActions` | 1 | `?canImportOfficers: SubmitButton` |
| `ClientPeopleSection` | 1 | `ClientPeopleActions, (n) PersonCard, Modal{ NewContactForm }, Modal{ ClientSetUpForm }, Modal{ ?personBeingEdited !== null: PersonFieldsForm }, Modal{ ?personToApproach !== null: AskClaudeToDraftApproach }` |
| `ClientProjectList` | 1 | — |
| `ClientRow` | 1 | `ClientStageForm` |
| `ClientSetUpForm` | 1 | `(2) FormField, SubmitButton` |
| `ClientStageForm` | 1 | — |
| `ClientTable` | 1 | `(n) ClientRow` |
| `ClosingStrip` | 1 | — |
| `CompanyContextMap` | 1 | `(n) ContextAreaRegion, (n) ContextLinkLine, (n) ContextPartNode` |
| `CompanyJobAdverts` | 1 | `FindJobAdvertsButton, (n) JobAdvertRow` |
| `CompanyNarrativeFields` | 1 | `(2) FormField` |
| `CompanyPayFields` | 1 | `[ (2) FormField ]` |
| `CompanyPlaceFields` | 1 | `(2) FormField` |
| `CompanyProfileForm` | 1 | `[ FormField CompanyPlaceFields FormField CompanyScaleFields ], CompanyNarrativeFields, SubmitButton` |
| `CompanyScaleFields` | 1 | `(2) FormField` |
| `CompanyWorkingDisclosure` | 1 | `DisclosureMarker, BreakdownTable` |
| `ComparisonCard` | 1 | `?comparison.tradingRoutes: SavedTradingRoutes` |
| `ComparisonsSection` | 1 | `SectionHeading, (n) ComparisonCard` |
| `CompletionBar` | 1 | — |
| `ContentPieceText` | 1 | — |
| `ContentPlanApprovalChannels` | 1 | — |
| `ContentPlanApprovalPicture` | 1 | `(n) LibraryPreview` |
| `ContentPlanApprovalTable` | 1 | `RecordsTable{ (3) RecordsCell, RecordsCell{ ContentPlanApprovalChannels }, RecordsCell{ ContentPlanApprovalPicture } }` |
| `ContentPlanApproveForm` | 1 | `FormErrorNote, Button` |
| `ContentPlanChannelLinks` | 1 | — |
| `ContentPlanChannelMoves` | 1 | `(n) ?channel.canMove: Button` |
| `ContentPlanChannelStages` | 1 | `(n) ( ContentStageBadge, ?channel.isExtra: Badge )` |
| `ContentPlanCounts` | 1 | `[ (5) StatTile ]` |
| `ContentPlanKindTable` | 1 | `RecordsTable{ (2) RecordsCell }` |
| `ContentPlanMoveModal` | 1 | `Modal{ ?entry !== null: ( (2) FormField, FormErrorNote, [ (2) Button ] ) }` |
| `ContentPlanPictureCell` | 1 | `Badge` |
| `ContentPlanRhythmTable` | 1 | `RecordsTable{ (4) RecordsCell }` |
| `ContentPlanWeekTable` | 1 | `RecordsTable{ RecordsCell, ?row.post === null: RecordsCell, (2) RecordsCell, ( ?row.dueFor === null: RecordsCell \| RecordsCell{ Badge } ), (4) RecordsCell, ( RecordsCell, RecordsCell{ ContentPlanChannelLinks }, (3) RecordsCell, RecordsCell{ ContentPlanPictureCell }, RecordsCell{ ContentPlanChannelStages }, RecordsCell{ ContentPlanChannelMoves } ) }` |
| `ContentPlanWeekTallies` | 1 | `(n) ( Badge, ?tally.extra !== noneExtra: Badge )` |
| `ContentPostChannelTable` | 1 | `RecordsTable{ ?row.isThisPiece: RecordsCell, Badge, RecordsCell, RecordsCell{ ContentStageBadge }, RecordsCell }` |
| `ContentPostPictures` | 1 | `?badge !== null: Badge, (n) [ LibraryPreview Badge ]` |
| `ContentReviewForm` | 1 | `FormField, FormErrorNote, [ (2) Button ]` |
| `ContentReviewList` | 1 | — |
| `ContentReviewPanel` | 1 | `DashboardPanel{ ?isAwaitingApproval: ContentReviewForm }` |
| `ContentStoryboardTable` | 1 | `RecordsTable{ (4) RecordsCell }` |
| `ContextAreaRegion` | 1 | — |
| `ContextChangeList` | 1 | `(n) EntityLink` |
| `ContextChangesPanel` | 1 | `DashboardPanel{ ?hasChanges(changes): (2) ContextChangeList }` |
| `ContextConfirmForm` | 1 | `FormErrorNote, SubmitButton` |
| `ContextConfirmationPanel` | 1 | `DashboardPanel{ ?isOpen: ContextConfirmForm }` |
| `ContextLinkLine` | 1 | — |
| `ContextPartLinkList` | 1 | `(2) EntityLink` |
| `ContextPartNode` | 1 | — |
| `ContextPartPanel` | 1 | `DashboardPanel{ ?steps.length > 0: ContextProcessStepList, ContextPartLinkList, ?canMark: ContextPartReviewForm }` |
| `ContextPartReviewForm` | 1 | `?isNotRight: FormField, FormErrorNote, SubmitButton` |
| `ContextProcessStepList` | 1 | `?step.roleKey !== null: EntityLink` |
| `ConversationBaton` | 1 | `?stations.length > 0: BatonTrack` |
| `ConversationComposer` | 1 | `FormErrorNote, [ HandOffPicker SubmitButton ]` |
| `CoverageStrip` | 1 | `[ (4) StatTile ]` |
| `CreatePatchForm` | 1 | `(4) FormField, SubmitButton` |
| `CriterionRow` | 1 | — |
| `DangerConfirmForm` | 1 | `FormErrorNote, SubmitButton` |
| `DeadlinesEmailCard` | 1 | `WidgetIcon, ?isSent: DeadlinesEmailSent, ?!isSent: ( FormField, FormErrorNote, SubmitButton )` |
| `DeadlinesEmailSent` | 1 | — |
| `DecisionAnswerEntry` | 1 | `DirectorAnswerEntry` |
| `DecisionAnswerForm` | 1 | `FormField, [ (3) Button ]` |
| `DemoActivityRow` | 1 | — |
| `DemoActivitySection` | 1 | `(n) DemoActivityRow, SubmitButton` |
| `DemoBrainSection` | 1 | — |
| `DemoConnectSection` | 1 | `CopyTextButton` |
| `DemoKindChoiceCard` | 1 | `SubmitButton` |
| `DemoLinkedSystemRow` | 1 | — |
| `DemoLinkedSystemsSection` | 1 | `(n) DemoLinkedSystemRow` |
| `DemoMoneySection` | 1 | — |
| `DemoOwnSystemSection` | 1 | — |
| `DemoQuestionsSection` | 1 | — |
| `DemoStartSection` | 1 | `(n) DemoKindChoiceCard, FormErrorNote` |
| `DeployHistoryEntry` | 1 | — |
| `DeployHistoryFilterBar` | 1 | `(2) InlineField` |
| `DeployNowButton` | 1 | — |
| `DiscoveryCallForm` | 1 | `[ (6) FormField ], FormField, FormErrorNote, SubmitButton` |
| `DiscoveryCallThankYou` | 1 | — |
| `DisplayNameForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `DocumentProse` | 1 | — |
| `DomainContextBox` | 1 | — |
| `DomainContextRow` | 1 | `?context.isCoreDomain: Badge` |
| `DomainEntityNode` | 1 | — |
| `DomainMap` | 1 | `(n) DomainContextBox, (n) DomainRelationshipLine, (n) DomainEntityNode` |
| `DomainRelationshipLine` | 1 | — |
| `DoneTaskFilter` | 1 | — |
| `EarningTypeIcon` | 1 | — |
| `EarningTypeTiles` | 1 | `EarningTypeIcon` |
| `EarningsForm` | 1 | `EarningTypeTiles, ?form.isEmployed: BigAmountField, ?form.isSelfEmployed: SelfEmploymentFields, TaxRegionField, MoreAccurateOptions` |
| `EditGoalForm` | 1 | `(2) SmallCapsField, [ SmallCapsField GoalHorizonField PriorityField ], FormErrorNote, SubmitButton` |
| `EmailPasswordForm` | 1 | `(2) SmallCapsField, FormErrorNote` |
| `EmptyTakeHome` | 1 | — |
| `EntityFieldList` | 1 | `(n) EntityFieldRow` |
| `EntityFieldRow` | 1 | `EntityLink` |
| `EntityPanel` | 1 | `DashboardPanel{ ?isOfAProject: RaiseChangeButton, EntityPlacement, EntityFieldList, ?relationships.length > 0: EntityRelationshipList, ?projectId !== null && screens.l…: EntityScreenLinks }` |
| `EntityPlacement` | 1 | `EntityLink` |
| `EntityRelationshipList` | 1 | `EntityLink` |
| `EntityScreenLinks` | 1 | — |
| `EstimateExclusions` | 1 | `DisclosureMarker` |
| `EveryPoundSection` | 1 | `SectionHeading, [ BreakdownCard YearComparisonCard TradingRoutesCard ], ?isPayingHigherRates(estimate): HighIncomeNotice` |
| `ExpenseExamples` | 1 | `DisclosureMarker` |
| `FeedDaySection` | 1 | — |
| `FeedScopeChips` | 1 | — |
| `FigureSources` | 1 | — |
| `FinishedProjectsToggle` | 1 | — |
| `FrameDrawer` | 1 | — |
| `FrameMenu` | 1 | `AccountMenu` |
| `FrameNavFolder` | 1 | `ChevronIcon, ?isOpen: (n) FrameNavLink` |
| `FramePickerList` | 1 | — |
| `FramePickers` | 1 | `FramePicker, FormErrorNote` |
| `FrameSideBar` | 1 | `BrandWordmark, ?hasOrganisationsToPick(picks): FramePickers, (n) ( ?section.label === null: (n) FrameNavLink \| FrameNavFolder ), FrameSignedIn` |
| `FrameSignedIn` | 1 | — |
| `FrameTopBar` | 1 | `[ MobileMenuButton NotificationsBell FrameMenu ]` |
| `GoalAutocompletePanel` | 1 | `DashboardPanel{ ?canSwitch: SubmitButton, FormErrorNote }` |
| `GoalDetailHeader` | 1 | `WorkspaceHeader{ GoalStatusPill, HeaderFacts }` |
| `GoalList` | 1 | `(n) GoalRow` |
| `GoalListPanel` | 1 | `DashboardPanel{ GoalStatusFilter, GoalList }, Modal{ AddGoalForm }, ?priorityGoal !== null: PriorityModal` |
| `GoalMeasurePanel` | 1 | `DashboardPanel{ ProseText }` |
| `GoalProgressLine` | 1 | `ProgressTrack` |
| `GoalRow` | 1 | `[ [ PriorityControls PriorityNumberButton ] ( ?!isOpen: GoalStatusPill, ?shouldShowCompletion: ProgressTrack ) ]` |
| `GoalSelectOptions` | 1 | — |
| `GoalStatusFilter` | 1 | — |
| `GoalTaskList` | 1 | `DashboardPanel{ TaskLinkList }` |
| `GoogleSignInButton` | 1 | — |
| `GuideDetails` | 1 | — |
| `HandOffPicker` | 1 | `(2) FormField` |
| `HeaderFact` | 1 | — |
| `HeldPieceCard` | 1 | `[ (2) Button ]` |
| `HeroChecklist` | 1 | `(n) LineIcon` |
| `HeroIllustration` | 1 | — |
| `HeroMockup` | 1 | `AppMockup, AssistantPhoneMockup` |
| `HeroPromiseRow` | 1 | `LineIcon, ?hasBadge: SignalBadge` |
| `HeroSection` | 1 | `BrandWordmark` |
| `HighIncomeNotice` | 1 | — |
| `HowItWorksSection` | 1 | `SectionHeading, PlainEnglishExplanations, FigureSources` |
| `ImageThumbnail` | 1 | — |
| `InternalItemCells` | 1 | `RecordsCell{ InternalItemTitle }, RecordsCell{ OwnerPicker }, RecordsCell{ StatusSelect }, RecordsCell{ DueDateField }, RecordsCell{ PriorityField }, RecordsCell` |
| `InternalItemTitle` | 1 | `ChevronIcon` |
| `InternalStatusBoard` | 1 | `[ (n) Badge ?column.items as item (item.id): StatusBoardCard ]` |
| `InternalTodoRows` | 1 | `RecordsCell{ TodoTickTitle }, RecordsCell{ TodoOwnerSelect }, RecordsCell{ StatusSelect }, RecordsCell{ DueDateField }, (2) RecordsCell, AddTodoLine` |
| `InternalWorkBoard` | 1 | `TabStrip, DashboardPanel{ BacklogFilterBar, ( ?isTableShown: InternalWorkTable \| ?chosenView.key === internalWork…: InternalStatusBoard \| InternalWorkCalendar ) }` |
| `InternalWorkCalendar` | 1 | `CalendarNavigation{ CalendarGrid }, UndatedEntries` |
| `InternalWorkGroupHeader` | 1 | `[ ChevronIcon Button ]` |
| `InternalWorkGroupTable` | 1 | `InternalWorkGroupHeader{ ?!isFolded: RecordsTable, InternalItemCells{ ?openItemIds.has(item.id): InternalTodoRows } }` |
| `InternalWorkTable` | 1 | `(n) InternalWorkGroupTable` |
| `InviteMemberForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `InvitePersonForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `ItemActions` | 1 | `?entries.length > 0 \|\| actions.c…: ( ?entries.length > 0: (n) BoardActionEntry, ?actions.canRaiseAgain: Button ), ?actions.canRecord: BoardActionForm` |
| `ItemDecision` | 1 | `Badge, ?answers.length > 0: (n) DecisionAnswerEntry, ?decision.canAnswer: DecisionAnswerForm` |
| `ItemRoomTalk` | 1 | `?badge !== null: Badge, ?said.length > 0: (n) BoardContributionEntry` |
| `JobAdvertRow` | 1 | — |
| `KitVersionRow` | 1 | `KitVersionBadge` |
| `LifecycleBadgeChip` | 1 | — |
| `LifecycleStepItem` | 1 | — |
| `LiveMarker` | 1 | — |
| `LivingCostsCard` | 1 | `WidgetIcon, FormField` |
| `MakingTaxDigitalCard` | 1 | `WidgetIcon, ?isInScope: QuarterlyDeadlines` |
| `MarkAllReadForm` | 1 | `SubmitButton` |
| `McpEntryCover` | 1 | `CoverSleeve{ McpEntryFace }` |
| `McpEntryDetails` | 1 | `DashboardPanel{ RaiseChangeButton, McpEntryFace, ( ?entry.kind === mcpEntryKinds.to…: ToolDoors \| GuideDetails ) }` |
| `McpMapBrowser` | 1 | `SectionCrates{ CoverAlbum{ McpEntryCover }, ?chosenEntry !== undefined: McpEntryDetails }` |
| `MeetingAgendaPanel` | 1 | `DashboardPanel{ (n) AgendaItemEntry, ?withdrawnTitles.length > 0: WithdrawnAgendaItems }` |
| `MeetingClosePanel` | 1 | `DashboardPanel{ Button }` |
| `MeetingFactsPanel` | 1 | `DashboardPanel` |
| `MeetingMinutesPanel` | 1 | `DashboardPanel{ ?minutes.latestVersion !== null: Badge, CopyTextButton, ?minutes.canAnswer && minutes.la…: MinutesAnswerForm, (n) MinutesVersionEntry }` |
| `MessageRow` | 1 | `ProseText` |
| `MileageAndHomeFields` | 1 | `[ (2) FormField ], ?form.vehicleType !== vehicleTyp…: PeriodAmountField` |
| `MinutesAnswerEntry` | 1 | `DirectorAnswerEntry` |
| `MinutesAnswerForm` | 1 | `FormField, [ (2) Button ]` |
| `MinutesVersionEntry` | 1 | `?answers.length > 0: (n) MinutesAnswerEntry` |
| `MobileNavDrawer` | 1 | `(n) MobileNavGroup, PortalLink` |
| `MobileNavGroup` | 1 | — |
| `MobileTakeHomeBar` | 1 | — |
| `ModalHeader` | 1 | `Button` |
| `MoreAccurateOptions` | 1 | `DisclosureMarker, PensionField, StudentLoanFields, ?form.isEmployed: PeriodAmountField, ?form.isSelfEmployed: MileageAndHomeFields` |
| `NameDirectorForm` | 1 | `FormField, FormErrorNote, SubmitButton` |
| `NavigationSpinner` | 1 | `?slowNavigation.isActive: BrandSpinner` |
| `NewContactForm` | 1 | `(4) FormField, SubmitButton` |
| `NewInternalTaskForm` | 1 | `NewTaskFormShell{ SmallCapsField, NewTaskDetailsField, TaskOwnerField, NewTaskDueDateField, TaskGoalAndKindFields, ?sequenceChoices.length > 0: TaskSequenceField }` |
| `NewOrganisationForm` | 1 | `OrganisationDetailsFields, FormErrorNote, SubmitButton` |
| `NewProjectForm` | 1 | `(3) SmallCapsField, OrganisationSelect, TeamProjectField, FormErrorNote, SubmitButton` |
| `NewTaskFormFooter` | 1 | `FormErrorNote, ( ?similarTasks.length > 0: SimilarTasksNotice \| SubmitButton )` |
| `NewTaskStoryFields` | 1 | — |
| `NotificationRow` | 1 | `SubmitButton` |
| `NotificationsBell` | 1 | — |
| `ObservationRow` | 1 | — |
| `OfferStepsSection` | 1 | `(n) OfferStepCard, DiscoveryCallButton` |
| `OfferTermsSection` | 1 | `DiscoveryCallButton` |
| `OfficerResultList` | 1 | `SubmitButton` |
| `OfficerSearchForm` | 1 | `SubmitButton` |
| `OrganisationBadge` | 1 | — |
| `OrganisationDetailInput` | 1 | `FormField` |
| `OrganisationDetailList` | 1 | — |
| `OrganisationDetailsForm` | 1 | `OrganisationDetailsFields, FormErrorNote, SubmitButton` |
| `OrganisationDetailsPanel` | 1 | `?canManage: Button, (n) DashboardPanel{ OrganisationDetailList }, Modal{ OrganisationDetailsForm }` |
| `OrganisationDirectorCells` | 1 | `RecordsCell{ PersonLine }, RecordsCell, ?canName: RecordsCell{ ?director.accountId !== null: Button }` |
| `OrganisationDirectorsPanel` | 1 | `?canNameAnother: Button, DashboardPanel{ RecordsTable{ OrganisationDirectorCells } }, Modal{ NameDirectorForm }` |
| `OrganisationMemberCells` | 1 | `RecordsCell{ PersonLine }, RecordsCell{ Badge }, RecordsCell, ?canManage: RecordsCell{ Button }, Button` |
| `OrganisationModuleCells` | 1 | `RecordsCell, RecordsCell{ Badge }, ?canSwitch: RecordsCell{ Button }` |
| `OrganisationModulesPanel` | 1 | `DashboardPanel{ RecordsTable{ OrganisationModuleCells } }` |
| `OrganisationOverviewTabs` | 1 | `TabStrip, ( ?shownTab === organisationOvervi…: OrganisationPeoplePanel \| ?shownTab === organisationOvervi…: OrganisationDetailsPanel \| ?shownTab === organisationOvervi…: OrganisationModulesPanel \| ?shownTab === organisationOvervi…: OrganisationDirectorsPanel )` |
| `OrganisationPeoplePanel` | 1 | `?canManage: Button, DashboardPanel{ RecordsTable{ OrganisationMemberCells } }, Modal{ InviteMemberForm }, ?memberAwaitingRemoval !== null: DangerConfirmModal` |
| `OrganisationRegister` | 1 | `(n) OrganisationRow` |
| `OrganisationRow` | 1 | — |
| `OrganisationsPageHeader` | 1 | `WorkspaceHeader` |
| `OwnBriefSummary` | 1 | — |
| `OwnClaudePanel` | 1 | `DashboardPanel{ [ Badge ?ownClaude.isAskingFirst: Badge ], ?ownClaude.canChange: ( [ (2) SeatSettingForm ], SteerNoteForm ), SteerNotesList }` |
| `OwnerPicker` | 1 | `(n) PersonInitials, Button` |
| `PairedScreenLink` | 1 | — |
| `PanelTabs` | 1 | `TabStrip` |
| `ParitySummary` | 1 | — |
| `ParticipantChip` | 1 | — |
| `PatchHeader` | 1 | `PageTitle` |
| `PatchMap` | 1 | — |
| `PatchMapPane` | 1 | `PatchMap, SectorLegend, AreaLegend` |
| `PatchRow` | 1 | — |
| `PatchSidebar` | 1 | `( ?selectedBuilding !== null: BuildingPanel \| ?sector !== null && sectorCovera…: SectorPanel \| ?selectedPremises !== null: PremisesPanel \| ?selectedSighting !== null: SightingPanel \| AreaCompanyPanel ), AreaCompanyList` |
| `PatchSummary` | 1 | — |
| `PatchTable` | 1 | `(n) PatchRow` |
| `PatchesOverview` | 1 | — |
| `PaymentTimeline` | 1 | — |
| `PaymentsOnAccountCard` | 1 | `WidgetIcon` |
| `PensionField` | 1 | `FormField` |
| `PeopleTable` | 1 | `(n) PersonRow` |
| `PersonCard` | 1 | `?canInvite: SubmitButton, PersonFacts, PersonLinkList, PersonNoteTimeline` |
| `PersonCompanyCard` | 1 | `StagePill, ?company.parentName === '': GroupUnderForm` |
| `PersonCompanyList` | 1 | `(n) PersonCompanyCard` |
| `PersonEventLedger` | 1 | — |
| `PersonHeader` | 1 | `PageTitle, PersonFacts` |
| `PersonLinkChip` | 1 | — |
| `PersonProfileFields` | 1 | `(5) FormField` |
| `PlainEnglishExplanations` | 1 | `DisclosureMarker` |
| `PointsSelect` | 1 | `InlineField` |
| `PortalClaudeAbilities` | 1 | `DashboardPanel` |
| `PortalClaudePlanRow` | 1 | — |
| `PortalClaudePlanSteps` | 1 | `DashboardPanel{ (n) PortalClaudePlanRow }` |
| `PortalConnectorAddress` | 1 | `DashboardPanel{ CopyTextButton }` |
| `PortalContextPrompt` | 1 | `DashboardPanel{ CopyTextButton }` |
| `PortalEnvironmentLink` | 1 | — |
| `PortalFrame` | 1 | `FrameSideBar, ?isDrawerOpen: FrameDrawer, FrameTopBar{ ?openProject !== null: ProjectSwitcher }` |
| `PortalGoalList` | 1 | `DashboardPanel{ ?goals.length > 0: (n) PortalGoalRow }` |
| `PortalHeader` | 1 | `[ BrandWordmark ?isSignedIn: SubmitButton ?!isSignedIn: SignInLink ]` |
| `PortalInviteForm` | 1 | `DashboardPanel{ (3) SmallCapsField, FormErrorNote, SubmitButton }` |
| `PortalPeopleList` | 1 | `DashboardPanel{ (n) PortalPersonRow }` |
| `PortalPersonActions` | 1 | `SubmitButton, FormErrorNote, DangerConfirmModal` |
| `PortalPersonRow` | 1 | `?canManage: PortalPersonActions` |
| `PortalProjectList` | 1 | `DashboardPanel{ ?projects.length > 0: (n) PortalProjectRow }` |
| `PortalProjectRow` | 1 | `[ PortalEnvironmentLink ProjectStatusBadge ], (n) PortalGoalRow` |
| `PortalRequestForm` | 1 | `DashboardPanel{ (3) SmallCapsField, FormErrorNote, SubmitButton }` |
| `PortalRequestList` | 1 | `DashboardPanel{ ?requests.length > 0: (n) PortalRequestRow }` |
| `PortalRequestReplyForm` | 1 | `FormErrorNote, SubmitButton` |
| `PortalRequestRow` | 1 | `?!request.isDone: PortalRequestReplyForm` |
| `PortalScreenCard` | 1 | — |
| `PortalScreensSection` | 1 | `(n) PortalScreenCard` |
| `PortalTaskList` | 1 | `DashboardPanel{ ?tasks.length > 0: (n) PortalTaskRow }` |
| `PortalTaskRow` | 1 | — |
| `PortalVisitorCard` | 1 | `PersonInitials` |
| `PremisesPanel` | 1 | `SubmitButton` |
| `PrintOnPaper` | 1 | — |
| `ProjectActionsMenu` | 1 | `ActionsMenu` |
| `ProjectBoard` | 1 | `ProjectsTabs, ( ?shownTab === priorityTasksTab: WaitingOnYouList \| ( ProjectFilterBar, ( ProjectTable, ProjectPagination ) ) )` |
| `ProjectDashboard` | 1 | `?isBuiltWork: ProjectStatePanel, ProjectPulseStrip, PanelTabs, ( ?isBuiltWork: TaskTreePanel \| InternalWorkBoard ), (2) GoalListPanel, ProjectPeoplePanel` |
| `ProjectDatabaseFields` | 1 | `[ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ]` |
| `ProjectDetailHeader` | 1 | `ProjectPageHeader{ ( ?isInternalProject: InternalProjectBadge \| KitVersionBadge ), ProjectHeaderMenu{ HeaderFacts } }, Modal{ EditProjectForm }` |
| `ProjectEditModals` | 1 | `Modal{ EditProjectForm }, DangerConfirmModal` |
| `ProjectFilterBar` | 1 | `FinishedProjectsToggle` |
| `ProjectHeaderMenu` | 1 | `ActionsMenu` |
| `ProjectNameLink` | 1 | `?project.isInternal: InternalProjectBadge` |
| `ProjectNewTaskModal` | 1 | `Modal{ ( ?isInternalSide: NewInternalTaskForm \| NewTaskForm ) }` |
| `ProjectOrganisationCell` | 1 | `OrganisationBadge` |
| `ProjectOwnerCell` | 1 | — |
| `ProjectPeoplePanel` | 1 | `DashboardPanel{ (n) PersonRow }, Modal{ InvitePersonForm }, Modal{ TransferOwnershipForm }, ?personAwaitingRemoval !== null: DangerConfirmModal` |
| `ProjectPositionField` | 1 | `PriorityField` |
| `ProjectPriorityCell` | 1 | `[ PriorityControls PriorityNumberButton ]` |
| `ProjectPulseStrip` | 1 | `[ (4) StatTile ]` |
| `ProjectRow` | 1 | `ProjectTaskTally, ProjectPriorityCell{ ProjectNameLink, ProjectStatusBadge, ProjectOwnerCell, ProjectOrganisationCell, KitVersionBadge, ProjectStatusBadge, ?project.taskCount > 0: CompletionBar, ?project.isYours: ProjectActionsMenu }` |
| `ProjectStatePanel` | 1 | `DashboardPanel{ ?goals.length > 0: (n) GoalProgressLine }` |
| `ProjectSwitcher` | 1 | `FramePicker` |
| `ProjectTable` | 1 | `ProjectTableHeader, (n) ProjectRow` |
| `ProjectTableHeader` | 1 | — |
| `ProjectTaskTally` | 1 | `AssignedToYouNote` |
| `ProjectsPageHeader` | 1 | `WorkspaceHeader` |
| `ProjectsTabs` | 1 | `TabStrip` |
| `PromoCaptionHeadline` | 1 | — |
| `PromoCaptions` | 1 | `(n) PromoCaptionHeadline` |
| `PromoChapterBar` | 1 | — |
| `PromoControls` | 1 | `LineIcon, PromoChapterBar{ LineIcon }` |
| `PromoEndCard` | 1 | `DiscoveryCallButton, LineIcon` |
| `PromoIntro` | 1 | `DiscoveryCallButton` |
| `PromoOverlay` | 1 | `PromoCaptions, ?!isReady: BrandSpinner, ?isWatching: ?clock.hasEnded: PromoEndCard, LineIcon, PromoControls` |
| `PromoPlayer` | 1 | `PromoOverlay` |
| `ProspectResultTable` | 1 | `[ (2) ( ProspectSeedFields, SubmitButton ) ]` |
| `ProspectSearchForm` | 1 | `(2) FormField, SubmitButton` |
| `QuarterlyDeadlines` | 1 | — |
| `QuarterlyViewNote` | 1 | — |
| `RaiseChangeModal` | 1 | `Modal{ NewTaskForm }` |
| `RecordsTableHead` | 1 | — |
| `RegisterStageTabs` | 1 | `TabStrip` |
| `RenameChecklistModal` | 1 | `Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `ResolveSupportTaskForm` | 1 | `FormErrorNote, SubmitButton` |
| `ResultPeriodToggle` | 1 | — |
| `ReviewModelForm` | 1 | `[ FormField SubmitButton FormErrorNote ]` |
| `SalesPagesTable` | 1 | `RecordsTable{ (2) RecordsCell }` |
| `SavedTradingRoutes` | 1 | — |
| `ScreenCover` | 1 | `CoverSleeve{ Wireframe }` |
| `ScreenDetails` | 1 | `DashboardPanel{ RaiseChangeButton, Wireframe, ?mcpMap !== null: ScreenTools }` |
| `ScreenTools` | 1 | — |
| `SeatSettingForm` | 1 | `Button` |
| `SectorClaimForms` | 1 | `[ ?isClaimed: SubmitButton SubmitButton SubmitButton ]` |
| `SectorCompanyRow` | 1 | — |
| `SectorLegend` | 1 | — |
| `SectorSearchForm` | 1 | `(3) FormField, SubmitButton` |
| `SectorSearchRow` | 1 | — |
| `SegmentLegend` | 1 | — |
| `SelfAssessmentBillCard` | 1 | `WidgetIcon, ?plan: PaymentTimeline, BreakdownTable` |
| `SelfAssessmentSection` | 1 | `SectionHeading, [ SelfAssessmentBillCard ?paymentsOnAccount: PaymentsOnAccountCard MakingTaxDigitalCard Class2Card ]` |
| `SelfEmploymentFields` | 1 | `( ?form.earningType === earningTyp…: BigAmountField \| PeriodAmountField ), PeriodAmountField, ExpenseExamples, ToggleSwitch{ ?isCisSubcontractor: PeriodAmountField }` |
| `SentFileList` | 1 | — |
| `SequenceStepNode` | 1 | `(2) TaskReferenceLink` |
| `SequenceTrack` | 1 | `(n) SequenceStepNode` |
| `SetPasswordModal` | 1 | `Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `SightingForm` | 1 | `[ (6) FormField ], FormField, SubmitButton` |
| `SightingPanel` | 1 | `( ?standing !== null: RegisterStandingLink \| SubmitButton ), SubmitButton` |
| `SightingRow` | 1 | — |
| `SignInLink` | 1 | — |
| `SimilarTasksNotice` | 1 | — |
| `SiteFooter` | 1 | `BrandWordmark` |
| `SiteHeader` | 1 | `[ BrandWordmark [ PortalLink DiscoveryCallButton AccountMenu ] MobileMenuButton ], ?isMobileMenuOpen: MobileNavDrawer` |
| `SiteMapBrowser` | 1 | `SectionCrates{ CoverAlbum{ ScreenCover }, ?chosenScreen !== undefined: ScreenDetails }` |
| `StageDots` | 1 | — |
| `StagedTaskRow` | 1 | — |
| `StagedTasksPanel` | 1 | `HeaderFacts, DashboardPanel{ (n) StagedTaskRow }` |
| `StatementTable` | 1 | `RecordsTable{ RecordsCell, StatementFigureCell }` |
| `StatusBoardCard` | 1 | `?task.dueDate !== null: TaskDueDate, [ (n) PersonInitials StatusSelect ]` |
| `SteerNoteForm` | 1 | `FormField, Button` |
| `SteerNotesList` | 1 | — |
| `StripeEventsToCheckTable` | 1 | `RecordsTable{ (3) RecordsCell, RecordsCell{ Badge }, RecordsCell, RecordsCell{ Button } }` |
| `StudentLoanFields` | 1 | `FormField` |
| `SubtaskList` | 1 | `DashboardPanel{ TaskLinkList }` |
| `SubtaskRows` | 1 | `(n) TaskListRow` |
| `SupportTaskFacts` | 1 | `?task.resolution !== '': ProseText` |
| `SupportTaskTable` | 1 | `RecordsTable{ (4) RecordsCell }` |
| `TakeHomeActions` | 1 | — |
| `TakeHomeCard` | 1 | `ResultPeriodToggle, ?!isLoss: ( TakeHomeDonut, SegmentLegend ), TakeHomeNote` |
| `TakeHomeDonut` | 1 | — |
| `TakeHomeEstimatePanel` | 1 | `TakeHomePanel{ ?estimate: TakeHomeCard, TakeHomeActions, EmptyTakeHome }` |
| `TakeHomeNote` | 1 | — |
| `TakeHomePageHead` | 1 | `PageMeta` |
| `TakeHomePanel` | 1 | — |
| `TaskAside` | 1 | `TaskFactsPanel, TaskComplexityPanel, TaskBranchPanel, LifecyclePanel, ConversationParticipantsPanel` |
| `TaskAttachmentsSection` | 1 | `DashboardPanel{ (n) AttachmentRow, ?errorMessage !== null: FormErrorNote }` |
| `TaskAutocompleteFact` | 1 | `TaskAutocompleteModal` |
| `TaskAutocompleteOption` | 1 | — |
| `TaskBranchForm` | 1 | `FormErrorNote, SubmitButton` |
| `TaskBranchLinks` | 1 | — |
| `TaskBranchPanel` | 1 | `DashboardPanel{ TaskBranchLinks, ?isEditing: TaskBranchForm }` |
| `TaskCardActions` | 1 | `[ TaskStatusChip ActionsMenu ]` |
| `TaskCardFact` | 1 | — |
| `TaskCardFacts` | 1 | `TaskCardFact{ ?hasAssignees: AssigneePills }, ?standing !== null: TaskCardFact{ TaskSequenceNote }, ?turn !== null && !isDone: TaskCardFact{ TaskTurnNote }` |
| `TaskCardFooter` | 1 | `[ TaskKindTags ?lifecycle !== null: LifecycleBadgeChip TaskProgressMeter [ ?task.dueDate !== null: TaskDueDate TaskRaisedDate ] ]` |
| `TaskCardHandle` | 1 | `[ PriorityControls PriorityNumberButton ]` |
| `TaskComplexityCount` | 1 | `FormField` |
| `TaskComplexityPanel` | 1 | `DashboardPanel{ [ (3) TaskComplexityCount ], FormErrorNote, SubmitButton }` |
| `TaskDepartmentField` | 1 | `SmallCapsField` |
| `TaskDetailHeader` | 1 | `WorkspaceHeader{ TaskKindPill }` |
| `TaskEditForm` | 1 | `(2) SmallCapsField, TaskStatusAndDueFields, TaskPlanningFields, TaskSequenceField, PriorityField, TaskGoalAndKindFields, TaskDepartmentField, TaskMoveFields, UserStoryFields, TeamPickerFieldset, FormErrorNote, SubmitButton` |
| `TaskFactsPanel` | 1 | `DashboardPanel{ ?task.dueDate !== null: TaskDueDate, TaskAutocompleteFact }` |
| `TaskFoldButton` | 1 | `?subtaskCount > 0: ChevronIcon` |
| `TaskGoalChoiceForm` | 1 | — |
| `TaskGoalModal` | 1 | `Modal{ FormErrorNote, (n) TaskGoalChoiceForm }` |
| `TaskGroupHeader` | 1 | `ChevronIcon` |
| `TaskGroupList` | 1 | `(n) TaskListRow` |
| `TaskGroupSection` | 1 | `TaskGroupHeader{ ?isOpen: TaskGroupList }` |
| `TaskGroupSections` | 1 | `(n) TaskGroupSection` |
| `TaskKindTags` | 1 | `TaskKindPill` |
| `TaskMoveFields` | 1 | `SmallCapsField, SmallCapsField` |
| `TaskOwnerField` | 1 | `SmallCapsField` |
| `TaskPageModals` | 1 | `Modal{ TaskEditForm }, Modal{ NewTaskForm }, DangerConfirmModal` |
| `TaskPlanningFields` | 1 | `[ (2) SmallCapsField ]` |
| `TaskProgressMeter` | 1 | — |
| `TaskRaisedDate` | 1 | — |
| `TaskRowModals` | 1 | `?statusTask !== null: TaskStatusModal, ?goalTask !== null: TaskGoalModal, ?priorityTask !== null: PriorityModal, ?storyPointsTask !== null: TaskStoryPointsModal, ?autocompleteTask !== null: TaskAutocompleteModal` |
| `TaskRowTitle` | 1 | `TaskFoldButton` |
| `TaskSequenceNote` | 1 | `TaskReferenceLink` |
| `TaskSequencePanel` | 1 | `DashboardPanel{ SequenceTrack }` |
| `TaskSheet` | 1 | `?target !== null && href !== null: Sheet, ( ?taskData === null: BrandSpinner \| TaskPage )` |
| `TaskStatusAndDueFields` | 1 | `[ (2) SmallCapsField ]` |
| `TaskStatusChip` | 1 | — |
| `TaskStatusModal` | 1 | `Modal{ FormErrorNote, (n) TaskStatusOption }` |
| `TaskStatusOption` | 1 | — |
| `TaskStoryPanel` | 1 | `DashboardPanel{ ?isSupportTask: SupportTaskFacts, ?task.details !== '': ProseText }` |
| `TaskStoryPointsModal` | 1 | `Modal{ FormErrorNote, (n) TaskStoryPointsOption }` |
| `TaskStoryPointsOption` | 1 | — |
| `TaskTodosPanel` | 1 | `?todos.length > 0: DashboardPanel, TodoStatusForm` |
| `TaskTreePanel` | 1 | `DashboardPanel{ BacklogFilterBar, TaskGroupSections }, ?longTermGroups.length > 0: DashboardPanel{ TaskGroupSections }` |
| `TaskTurnNote` | 1 | — |
| `TaskUploadZone` | 1 | — |
| `TaskWaitingNote` | 1 | `?waitedFor !== null: TaskReferenceLink` |
| `TaxRegionField` | 1 | `FormField` |
| `TaxYearSelect` | 1 | `InlineField` |
| `TeamPickerFieldset` | 1 | — |
| `TeamSection` | 1 | `(n) TeamMemberProfile` |
| `TeamWorkTable` | 1 | `RecordsTable{ (3) RecordsCell, RecordsCell{ Badge }, RecordsCell }` |
| `TodoOwnerSelect` | 1 | — |
| `TodoStatusForm` | 1 | — |
| `TodoTickTitle` | 1 | — |
| `ToggleSwitch` | 1 | — |
| `ToolDoors` | 1 | `(n) PairedScreenLink` |
| `TradingRouteNotes` | 1 | `DisclosureMarker` |
| `TradingRouteTiles` | 1 | — |
| `TradingRoutesCard` | 1 | `TradingRouteTiles, CompanyPayFields, ?company: CompanyWorkingDisclosure, TradingRouteNotes` |
| `TransferOwnershipForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `UndatedEntries` | 1 | `Badge, ?entries as entry (entry.id): CalendarEntryLink` |
| `UserStoryFields` | 1 | `?isUserStory: [ (3) FormField ]` |
| `WaitingOnYouList` | 1 | `(n) WaitingTaskRow` |
| `WaitingTaskRow` | 1 | — |
| `WhatIfCard` | 1 | `WidgetIcon` |
| `WhatWeDoSection` | 1 | `(n) OfferStepCard, [ DiscoveryCallButton BrandWordmark ]` |
| `WireframeNode` | 1 | `?depth <= deepestDrawn: (n) ( ?isContainer: (n) Self \| WireframeShape )` |
| `WireframeShape` | 1 | — |
| `WithdrawnAgendaItems` | 1 | — |
| `YearComparisonCard` | 1 | — |
| `+error` | 0 | `PageTitle` |
| `+layout` | 0 | `NavigationSpinner, ?isFramed: PortalFrame, ?!isFramed: ( ?isPortal: PortalHeader, ?!isPortal: SiteHeader, SiteFooter )` |
| `+page` | 0 | `PageMeta, HeroSection, BusinessAppSection, WhatWeDoSection, BuiltForSection, TeamSection, DiscoveryCallSection` |
