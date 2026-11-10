# Site definition

Written on 2026-11-10 from the views themselves — by the widget identification or the code quality check, never by hand, so it is never stale. Each route is what a user sees there, in the widget notation; each component of the site is defined the same way.

**49 routes, 510 components of the site, 7 catalogue widgets.** 148 widget usages and 35 pieces of markup written by hand where a widget should be, in 32 views; 0 content widgets draw their own box.

**Notation.** `a, b` stacked top to bottom · `[ a b ]` side by side · `(3) a` three of them, `(n) a` one per item · `?when: a` shown on a condition · `( a | b )` one or the other · `Widget{ … }` a catalogue widget with its content · `Part=( … )` one of the site's own components opened out · `⚠table→RecordsTable` markup written by hand where the named widget should be.

## Written by hand where a widget should be

| Should be | Written by hand | Where |
| --- | --- | --- |
| `FormField` | 23 in 20 files | `src/lib/components/admin/PointsSelect.svelte`, `src/lib/components/admin/ReviewModelForm.svelte`, `src/lib/components/clients/AskClaudeToResearch.svelte`, `src/lib/components/clients/ProspectSearchForm.svelte`, `src/lib/components/clients/map/AreaSearchForm.svelte`, `src/lib/components/contact/DiscoveryCallForm.svelte` +14 |
| `PageTitle` | 11 in 11 files | `src/lib/components/about/AboutStorySection.svelte`, `src/lib/components/case-study/CaseStudyIntroSection.svelte`, `src/lib/components/demo/DemoConnectSection.svelte`, `src/lib/components/demo/DemoStartSection.svelte`, `src/lib/components/home/HeroSection.svelte`, `src/lib/components/offer/OfferStepsSection.svelte` +5 |
| `RecordsTable` | 1 in 1 files | `src/lib/components/taxCalculator/BreakdownTable.svelte` |

## Content widgets that draw their own box

No content widget draws its own box.

## The widgets' designs

Brand sheet: `docs/design/brand.md`, the site last checked against it never. 4 of 7 catalogue widgets have a design sheet; the widgets were last checked against them never. Say *"Check the site against the brand"* and *"Check the widgets against their designs"* to run the checks, *"Extract the brand from <references>"* and *"Extract the design for <Widget> from <images>"* to bring the sheets up to date (the `widget-design` skill) — each a judgement, so run on request, never by the audit.

| Widget | Design | Last checked |
| --- | --- | --- |
| `DashboardPanel` | `docs/design/widgets/DashboardPanel.md` | — |
| `EmptyState` | brand only | — |
| `FormField` | `docs/design/widgets/FormField.md` | — |
| `Modal` | `docs/design/widgets/Modal.md` | — |
| `PageTitle` | brand only | — |
| `Sheet` | brand only | — |
| `TabStrip` | `docs/design/widgets/TabStrip.md` | — |

## Routes

### `/about`
`src/routes/about/+page.svelte`

```
PageMeta, AboutStorySection=( ⚠h1→PageTitle ), AboutTeamSection=( (n) TeamMemberProfile ), DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/account`
`src/routes/account/+page.svelte`

```
[ PageTitle SubmitButton ], Modal{ DisplayNameForm=( SmallCapsField, FormErrorNote, SubmitButton ) }
```

### `/account/set-password`
`src/routes/account/set-password/+page.svelte`

```
PageTitle, (2) SmallCapsField, FormErrorNote
```

### `/account/sign-in`
`src/routes/account/sign-in/+page.svelte`

```
PageTitle, EmailPasswordForm=( (2) SmallCapsField, FormErrorNote ), GoogleSignInButton
```

### `/admin`
`src/routes/admin/+page.svelte`

```
PageTitle, BuildModelsPanel=( ReviewModelForm=( [ ⚠select→FormField SubmitButton FormErrorNote ] ), (n) BuildModelRow=( [ (2) PointsSelect=( ⚠select→FormField ) SubmitButton ], FormErrorNote ), BuildModelRow=( [ (2) PointsSelect=( ⚠select→FormField ) SubmitButton ], FormErrorNote ) ), (n) AdminUserRow=( AdminActionsMenu=( ActionsMenu{ (3) AdminMenuAction, ?!user.isAdmin: AdminMenuAction }, SetPasswordModal=( Modal{ SmallCapsField, FormErrorNote, SubmitButton } ) ) )
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

### `/case-study`
`src/routes/case-study/+page.svelte`

```
PageMeta, CaseStudyIntroSection=( ⚠h1→PageTitle ), (n) CaseStudyBusinessSection=( CaseStudyOutcomes ), PortalScreensSection=( (n) PortalScreenCard ), CaseStudyMethodSection, DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/clients`
`src/routes/clients/+page.svelte`

```
PageTitle, FormErrorNote, AddLeadForm=( ( ?leadKind === leadKinds.person: AddPersonForm=( SubmitButton ) | SubmitButton ) ), StageFilterTabs, ( ?clients.length === 0: EmptyState | ClientTable=( (n) ClientRow=( ClientStageForm ) ) )
```

### `/clients/[clientId]`
`src/routes/clients/[clientId]/+page.svelte`

```
ClientHeader=( PageTitle ), FormErrorNote, CompanyJobAdverts=( FindJobAdvertsButton=( Modal{ AskClaudeToFindJobAdverts=( CopyTextButton ) } ), (n) JobAdvertRow ), CompanyProfileForm=( [ FormField CompanyPlaceFields=( (2) FormField ) FormField CompanyScaleFields=( (2) FormField ) ], CompanyNarrativeFields=( (2) FormField ), SubmitButton ), ClientPeopleSection=( ClientPeopleActions=( ?canImportOfficers: SubmitButton ), (n) PersonCard=( ?canInvite: SubmitButton, PersonFacts=( WarmthPill ), PersonLinkList=( (n) PersonLinkChip, SubmitButton ), PersonNoteTimeline=( ProseText, SubmitButton ) ), Modal{ NewContactForm=( (4) FormField, SubmitButton ) }, Modal{ ClientSetUpForm=( (2) FormField, SubmitButton ) }, Modal{ ?personBeingEdited !== null: PersonFieldsForm=( [ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields=( (5) FormField ) ], SubmitButton ) }, Modal{ ?personToApproach !== null: AskClaudeToDraftApproach=( CopyTextButton ) } ), ClientGroupSection=( ?children.length > 0: StagePill, ?children.length === 0 && parent…: GroupUnderForm=( SubmitButton ) ), ClientProjectList, ClientContinuityCopySection=( [ (3) FormField ], SubmitButton ), SupportTaskTable, ClientObservations=( ?observations.length > 0: (n) ObservationRow ), ClientEventLedger, ClientDeletion=( DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ), Modal{ AssignProjectForm=( FormField, (2) FormField, SubmitButton ) }
```

### `/clients/[clientId]/context`
`src/routes/clients/[clientId]/context/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), ( ?data.reading === null: EmptyState | CompanyContextView=( CompanyContextMap=( (n) ContextAreaRegion, (n) ContextLinkLine, (n) ContextPartNode ), ( ?selectedPart === undefined: EmptyState | ContextPartPanel=( DashboardPanel{ ?steps.length > 0: ContextProcessStepList=( ?step.roleKey !== null: EntityLink ), ContextPartLinkList=( (2) EntityLink ), ?canMark: ContextPartReviewForm=( ?isNotRight: FormField, FormErrorNote, SubmitButton ) } ) ), ContextConfirmationPanel=( DashboardPanel{ ?isOpen: ContextConfirmForm=( FormErrorNote, SubmitButton ) } ), ?changes !== null: ContextChangesPanel=( DashboardPanel{ ?hasChanges(changes): (2) ContextChangeList=( (n) EntityLink ) } ) ) )
```

### `/clients/feed`
`src/routes/clients/feed/+page.svelte`

```
AreaFeedHeader=( [ PageTitle LiveMarker ], (2) FeedScopeChips ), AreaFeedScoreboard=( [ (4) StatTile ] ), ( ?days.length === 0: EmptyState | ( (n) FeedDaySection, AreaEventRow=( AreaEventPill ) ) )
```

### `/clients/map`
`src/routes/clients/map/+page.svelte`

```
PageTitle, AreaSearchForm=( ⚠input→FormField, ⚠select→FormField, ⚠input→FormField, SubmitButton ), LeadOutcomeNote=( FormErrorNote ), ?area !== null: ( AreaSummary, AreaMapWorkspace=( AreaMapPane=( AreaMap, AreaLegend ){ AreaCompanyPanel=( ?isOneCompany: FindJobAdvertsButton=( Modal{ AskClaudeToFindJobAdverts } ), ( ?registerStanding !== null: RegisterStandingLink=( StagePill ) | ?canBecomeLead: [ (2) ( ProspectSeedFields, SubmitButton ) ] ) ), AreaCompanyList=( (n) AreaCompanyRow=( ?standing !== null: StagePill ) ) } ) )
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
PageTitle, ( ?!data.isConfigured: FormErrorNote | ProspectSearchForm=( (2) ⚠input→FormField, SubmitButton ) ), ?companies !== null && companies…: EmptyState, ?companies !== null && companies…: ProspectResultTable=( [ (2) ( ProspectSeedFields, SubmitButton ) ] )
```

### `/clients/research`
`src/routes/clients/research/+page.svelte`

```
PageTitle, AskClaudeToResearch=( ?clientId === null: ⚠input→FormField, CopyTextButton )
```

### `/company`
`src/routes/company/+page.svelte`

```
LegalArticle=( ⚠h1→PageTitle )
```

### `/contact`
`src/routes/contact/+page.svelte`

```
PageMeta, [ ⚠h1→PageTitle ( ?isSent: DiscoveryCallThankYou, ?!isSent: DiscoveryCallForm=( [ (6) FormField ], FormField, ⚠input→FormField, FormErrorNote, SubmitButton ) ) ]
```

### `/demo`
`src/routes/demo/+page.svelte`

```
PageMeta, DemoStartSection=( ⚠h1→PageTitle, (n) DemoKindChoiceCard=( SubmitButton ), FormErrorNote )
```

### `/demo/[token]`
`src/routes/demo/[token]/+page.svelte`

```
PageMeta, DemoConnectSection=( ⚠h1→PageTitle, CopyTextButton ), DemoQuestionsSection, DemoMoneySection, DemoLinkedSystemsSection=( (n) DemoLinkedSystemRow ), DemoBrainSection, DemoActivitySection=( (n) DemoActivityRow, SubmitButton ), DemoOwnSystemSection
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
PageMeta, OfferStepsSection=( ⚠h1→PageTitle, (n) OfferStepCard=( ?step.isMonthlyRetainer: SignalBadge ), DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) ), OfferTermsSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) ), DiscoveryCallSection=( DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/organisations`
`src/routes/organisations/+page.svelte`

```
OrganisationsPageHeader=( WorkspaceHeader=( ⚠h1→PageTitle ) ){ FlashMessage, ( ?organisations.length === 0: EmptyState | OrganisationRegister=( (n) OrganisationRow ) ), Modal{ NewOrganisationForm=( OrganisationDetailsFields=( (2) SmallCapsField, ⚠input→FormField, [ (2) ⚠input→FormField ] ), FormErrorNote, SubmitButton ) } }
```

### `/organisations/[organisationId]`
`src/routes/organisations/[organisationId]/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), FlashMessage, OrganisationProjectsPanel=( DashboardPanel{ (n) OrganisationProjectRow=( ProjectStatusBadge ) } ), OrganisationPeoplePanel=( DashboardPanel{ (n) OrganisationMemberRow=( PersonInitials ) }, Modal{ InviteMemberForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, ?memberAwaitingRemoval !== null: DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ), InvoicingDetailsPanel=( DashboardPanel, Modal{ OrganisationDetailsForm=( OrganisationDetailsFields=( (2) SmallCapsField, ⚠input→FormField, [ (2) ⚠input→FormField ] ), FormErrorNote, SubmitButton ) } ), OrganisationModulesPanel=( ?shownModules.length > 0: DashboardPanel{ (n) OrganisationModuleRow } ), ?data.modules.includes('boardroo…: OrganisationDirectorsPanel=( DashboardPanel{ (n) OrganisationDirectorRow=( PersonInitials ), ?canNameAnother: NameDirectorForm=( ⚠select→FormField ) } ), DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) )
```

### `/people`
`src/routes/people/+page.svelte`

```
PageTitle, FormErrorNote, AddPersonForm=( SubmitButton ), ?data.isCompaniesHouseConfigured: OfficerSearchForm=( SubmitButton ), ?officers !== null && officers.l…: EmptyState, ?officers !== null && officers.l…: OfficerResultList=( SubmitButton ), ( ?people.length === 0: EmptyState | PeopleTable=( (n) PersonRow=( PersonInitials ) ) )
```

### `/people/[personId]`
`src/routes/people/[personId]/+page.svelte`

```
PersonHeader=( PageTitle, PersonFacts=( WarmthPill ) ){ FormErrorNote, PersonLinkList=( (n) PersonLinkChip, SubmitButton ), ?data.pendingAppointments !== nu…: AppointmentImportForm=( ?appointments.length > 0: [ ⚠input→FormField SubmitButton ] ), PersonCompanyList=( (n) PersonCompanyCard=( StagePill, ?company.parentName === '': GroupUnderForm=( SubmitButton ) ) ), PersonNoteTimeline=( ProseText, SubmitButton ), PersonEventLedger }, Modal{ PersonFieldsForm=( [ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields=( (5) FormField ) ], SubmitButton ) }, Modal{ AskClaudeToDraftApproach=( CopyTextButton ) }, Modal{ AskClaudeToResearchPerson=( CopyTextButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) )
```

### `/portal`
`src/routes/portal/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ){ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalProjectList=( DashboardPanel{ ?projects.length > 0: (n) PortalProjectRow=( [ PortalEnvironmentLink ProjectStatusBadge ], (n) PortalGoalRow=( ProgressTrack ) ) } ), DashboardPanel{ PortalVisitorCard=( PersonInitials ) }, ?hasSeveralOrganisations(visitor): PortalOrganisationSwitch=( DashboardPanel{ FormErrorNote, SubmitButton } )
```

### `/portal/connect`
`src/routes/portal/connect/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), PortalConnectorAddress=( DashboardPanel{ CopyTextButton } ), PortalClaudeAbilities=( DashboardPanel ), PortalClaudePlanSteps=( DashboardPanel{ (n) PortalClaudePlanRow } ), PortalContextPrompt=( DashboardPanel{ CopyTextButton } )
```

### `/portal/context`
`src/routes/portal/context/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), ( ?data.reading === null: EmptyState | CompanyContextView=( CompanyContextMap=( (n) ContextAreaRegion, (n) ContextLinkLine, (n) ContextPartNode ), ( ?selectedPart === undefined: EmptyState | ContextPartPanel=( DashboardPanel{ ?steps.length > 0: ContextProcessStepList=( ?step.roleKey !== null: EntityLink ), ContextPartLinkList=( (2) EntityLink ), ?canMark: ContextPartReviewForm=( ?isNotRight: FormField, FormErrorNote, SubmitButton ) } ) ), ContextConfirmationPanel=( DashboardPanel{ ?isOpen: ContextConfirmForm=( FormErrorNote, SubmitButton ) } ), ?changes !== null: ContextChangesPanel=( DashboardPanel{ ?hasChanges(changes): (2) ContextChangeList=( (n) EntityLink ) } ) ) )
```

### `/portal/people`
`src/routes/portal/people/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ){ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalPeopleList=( DashboardPanel{ (n) PortalPersonRow=( ?canManage: PortalPersonActions=( SubmitButton, FormErrorNote, DangerConfirmModal ) ) } ), ?visitor.isAdministrator: PortalInviteForm=( DashboardPanel{ (3) SmallCapsField, FormErrorNote, SubmitButton } )
```

### `/portal/projects/[projectId]`
`src/routes/portal/projects/[projectId]/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ){ ProjectStatusBadge, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) }, PortalTaskList=( DashboardPanel{ ?tasks.length > 0: (n) PortalTaskRow } ), PortalGoalList=( DashboardPanel{ ?goals.length > 0: (n) PortalGoalRow=( ProgressTrack ) } ), PortalRequestForm=( DashboardPanel{ (3) SmallCapsField, FormErrorNote, SubmitButton } ), PortalRequestList=( DashboardPanel{ ?requests.length > 0: (n) PortalRequestRow=( ?!request.isDone: PortalRequestReplyForm=( FormErrorNote, SubmitButton ) ) } )
```

### `/privacy`
`src/routes/privacy/+page.svelte`

```
LegalArticle=( ⚠h1→PageTitle )
```

### `/projects`
`src/routes/projects/+page.svelte`

```
ProjectsPageHeader=( WorkspaceHeader=( ⚠h1→PageTitle ) ){ FlashMessage, WaitingOnYouSection=( ToActOnSection{ (n) WaitingTaskRow } ), ProjectBoardTabs=( OrganisationFilterChips, TabStrip, ( ?isTeamTab: TeamProjectsSection=( TeamProjectTable=( ProjectTableHeader, (n) TeamProjectRow ) ) | ProjectBoard=( ProjectFilterBar=( FinishedProjectsToggle ), ( ProjectTable=( ProjectTableHeader, ProjectRow ), ProjectPagination ) ) ) ), Modal{ NewProjectForm=( (2) SmallCapsField, OrganisationSelect=( ?organisations.length > 0: SmallCapsField ), TeamProjectField, FormErrorNote, SubmitButton ) }, ?selectedProject !== null: ProjectEditModals=( Modal{ EditProjectForm=( (2) SmallCapsField, [ SmallCapsField ProjectPositionField=( PriorityField ) ], OrganisationSelect=( ?organisations.length > 0: SmallCapsField ), TeamProjectField, (2) SmallCapsField, [ (3) SmallCapsField ], ProjectDatabaseFields=( [ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ] ), FormErrorNote, SubmitButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ), PriorityModal=( Modal{ PriorityField=( SmallCapsField ), FormErrorNote, SubmitButton } ) }
```

### `/projects/[projectId]`
`src/routes/projects/[projectId]/+page.svelte`

```
ProjectDetailHeader=( WorkspaceHeader=( ⚠h1→PageTitle ){ ProjectStatusBadge, OrganisationBadge, KitVersionBadge, ProjectHeaderMenu=( ActionsMenu{ DeployNowButton } ){ HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } }, Modal{ EditProjectForm=( (2) SmallCapsField, [ SmallCapsField ProjectPositionField=( PriorityField ) ], OrganisationSelect=( ?organisations.length > 0: SmallCapsField ), TeamProjectField, (2) SmallCapsField, [ (3) SmallCapsField ], ProjectDatabaseFields=( [ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ] ), FormErrorNote, SubmitButton ) } ), FlashMessage, DepartmentTabs, ProjectDashboard=( ProjectStatePanel=( DashboardPanel ), ProjectPulseStrip=( [ (4) StatTile ] ), PanelTabs=( TabStrip ), TaskTreePanel=( DashboardPanel{ BacklogFilterBar=( CountedFilterChip{ AssigneeFilterChips{ DoneTaskFilter } } ), TaskGroupSections=( (n) TaskGroupSection ) }, ?longTermGroups.length > 0: DashboardPanel{ TaskGroupSections=( (n) TaskGroupSection ) } ), StagedTasksPanel=( DashboardPanel{ (n) StagedTaskRow } ), DeployHistoryPanel=( DashboardPanel{ (n) DeployHistoryEntry } ), (2) GoalListPanel=( DashboardPanel{ GoalStatusFilter, GoalList=( (n) GoalRow ) }, Modal{ AddGoalForm=( (2) SmallCapsField, GoalHorizonField, FormErrorNote, SubmitButton ) }, ?priorityGoal !== null: PriorityModal=( Modal{ PriorityField, FormErrorNote, SubmitButton } ) ), ProjectPeoplePanel=( DashboardPanel{ (n) PersonRow=( PersonInitials ) }, Modal{ InvitePersonForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, Modal{ TransferOwnershipForm=( SmallCapsField, FormErrorNote, SubmitButton ) }, ?personAwaitingRemoval !== null: DangerConfirmModal=( DangerConfirmForm ) ) ), Modal{ NewTaskForm=( (3) SmallCapsField, ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), ?sequenceChoices.length > 0: TaskSequenceField=( SmallCapsField ), NewTaskFormFooter=( FormErrorNote, ( ?similarTasks.length > 0: SimilarTasksNotice | SubmitButton ) ) ) }, TaskRowModals=( ?statusTask !== null: TaskStatusModal=( Modal{ FormErrorNote, (n) TaskStatusOption } ), ?goalTask !== null: TaskGoalModal=( Modal{ FormErrorNote, (n) TaskGoalChoiceForm } ), ?priorityTask !== null: PriorityModal=( Modal{ PriorityField=( SmallCapsField ), FormErrorNote, SubmitButton } ), ?storyPointsTask !== null: TaskStoryPointsModal=( Modal{ FormErrorNote, (n) TaskStoryPointsOption } ), ?autocompleteTask !== null: TaskAutocompleteModal=( Modal{ FormErrorNote, (n) TaskAutocompleteOption } ) ), TaskSheet=( ?target !== null && href !== null: Sheet, ( ?taskData === null: BrandSpinner | TaskPage ) )
```

### `/projects/[projectId]/deploys`
`src/routes/projects/[projectId]/deploys/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), DashboardPanel{ DeployHistoryFilterBar=( (2) ⚠input→FormField ), (n) DeployHistoryEntry }, ProjectPagination
```

### `/projects/[projectId]/domain`
`src/routes/projects/[projectId]/domain/+page.svelte`

```
BlueprintHeader=( WorkspaceHeader=( ⚠h1→PageTitle ){ BlueprintViewSwitch, SubmitButton, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ), FlashMessage, ( ?domain === null: EmptyState | DomainExplorer=( DomainMap=( (n) DomainContextBox, (n) DomainRelationshipLine, (n) DomainEntityNode ), ( ?chosenEntity === undefined: EmptyState | EntityPanel=( DashboardPanel{ RaiseChangeButton=( RaiseChangeModal ), EntityPlacement=( EntityLink ), EntityFieldList=( (n) EntityFieldRow ), ?relationships.length > 0: EntityRelationshipList=( EntityLink ), ?screens.length > 0: EntityScreenLinks } ) ) ) )
```

### `/projects/[projectId]/goals/[goalId]`
`src/routes/projects/[projectId]/goals/[goalId]/+page.svelte`

```
GoalDetailHeader=( WorkspaceHeader=( ⚠h1→PageTitle ){ GoalStatusPill, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ){ FlashMessage, GoalMeasurePanel=( DashboardPanel{ ProseText } ), GoalAutocompletePanel=( DashboardPanel{ ?canSwitch: SubmitButton, FormErrorNote } ), GoalTaskList=( DashboardPanel{ TaskLinkList=( TaskKindPill ) } ), ConversationThread=( DashboardPanel{ ConversationBaton=( ?stations.length > 0: BatonTrack=( (n) BatonStationNode ) ), (n) MessageRow=( ProseText ), ConversationComposer=( FormErrorNote, [ HandOffPicker=( (2) ⚠select→FormField ) SubmitButton ] ) } ), LifecyclePanel=( DashboardPanel{ (n) LifecycleStepItem } ), ConversationParticipantsPanel=( DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm=( SubmitButton ) } ), Modal{ EditGoalForm=( (2) SmallCapsField, [ SmallCapsField GoalHorizonField=( SmallCapsField ) PriorityField=( SmallCapsField ) ], FormErrorNote, SubmitButton ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) }
```

### `/projects/[projectId]/site-map`
`src/routes/projects/[projectId]/site-map/+page.svelte`

```
BlueprintHeader=( WorkspaceHeader=( ⚠h1→PageTitle ){ BlueprintViewSwitch, SubmitButton, HeaderFacts=( ?facts.length > 0: (n) HeaderFact ) } ), FlashMessage, AudienceSwitch, ?mcpMap !== null: ParitySummary, ( ?audience === siteMapAudiences.c…: ( ?mcpMap === null: EmptyState, McpMapBrowser=( SectionCrates{ CoverAlbum{ McpEntryCover=( CoverSleeve{ McpEntryFace } ) }, ?chosenEntry !== undefined: McpEntryDetails=( DashboardPanel{ RaiseChangeButton=( RaiseChangeModal ), McpEntryFace, ( ?entry.kind === mcpEntryKinds.to…: ToolDoors=( (n) PairedScreenLink ) | GuideDetails ) } ) } ) ) | ?siteMap === null: EmptyState | SiteMapBrowser=( SectionCrates{ CoverAlbum{ ScreenCover=( CoverSleeve{ Wireframe=( WireframeNode ) } ) }, ?chosenScreen !== undefined: ScreenDetails=( DashboardPanel{ RaiseChangeButton=( RaiseChangeModal ), Wireframe=( WireframeNode ), ?mcpMap !== null: ScreenTools } ) } ) )
```

### `/projects/[projectId]/tasks/[taskId]`
`src/routes/projects/[projectId]/tasks/[taskId]/+page.svelte`

```
TaskDetailHeader=( WorkspaceHeader=( ⚠h1→PageTitle ){ TaskKindPill } ){ FlashMessage, TaskWaitingNote=( ?waitedFor !== null: TaskReferenceLink ), TaskStoryPanel=( DashboardPanel{ ?isSupportTask: SupportTaskFacts=( ?task.resolution !== '': ProseText ), ?task.details !== '': ProseText } ), ?isAwaitingResolution: ResolveSupportTaskForm=( FormErrorNote, SubmitButton ), AcceptanceCriteriaSection=( DashboardPanel{ (n) CriterionRow }, Modal{ SmallCapsField, FormErrorNote, SubmitButton } ), SubtaskList=( DashboardPanel{ TaskLinkList=( TaskKindPill ) } ){ TaskSequencePanel=( DashboardPanel{ SequenceTrack=( (n) SequenceStepNode=( (2) TaskReferenceLink ) ) } ), TaskTodosPanel=( ?todos.length > 0: DashboardPanel, TodoStatusForm ), ChecklistSection=( DashboardPanel{ (n) ChecklistPanel=( ?items.length > 0: (n) ChecklistItemRow, AddChecklistItemForm=( SubmitButton, FormErrorNote ), RenameChecklistModal=( Modal{ SmallCapsField, FormErrorNote, SubmitButton } ), DangerConfirmModal=( DangerConfirmForm ) ) }, Modal{ SmallCapsField, FormErrorNote, SubmitButton } ), TaskAttachmentsSection=( DashboardPanel{ (n) AttachmentRow=( AttachmentThumbnail=( ?isImage: ImageThumbnail ), ?canPreview: AttachmentPreviewModal=( Modal ), DangerConfirmModal=( DangerConfirmForm ) ), ?errorMessage !== null: FormErrorNote } ), ConversationThread=( DashboardPanel{ ConversationBaton=( ?stations.length > 0: BatonTrack=( (n) BatonStationNode ) ), (n) MessageRow=( ProseText ), ConversationComposer=( FormErrorNote, [ HandOffPicker=( (2) ⚠select→FormField ) SubmitButton ] ) } ) }, TaskAside=( TaskFactsPanel=( DashboardPanel{ ?task.dueDate !== null: TaskDueDate, TaskAutocompleteFact=( TaskAutocompleteModal ) } ), TaskComplexityPanel=( DashboardPanel{ [ (3) TaskComplexityCount=( ⚠input→FormField ) ], FormErrorNote, SubmitButton } ), TaskBranchPanel=( DashboardPanel{ TaskBranchLinks, ?isEditing: TaskBranchForm=( FormErrorNote, SubmitButton ) } ), LifecyclePanel=( DashboardPanel{ (n) LifecycleStepItem } ), ConversationParticipantsPanel=( DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm=( SubmitButton ) } ) ), TaskPageModals=( Modal{ TaskEditForm=( (2) SmallCapsField, TaskStatusAndDueFields=( [ (2) SmallCapsField ] ), TaskPlanningFields=( [ (2) SmallCapsField ] ), TaskSequenceField=( SmallCapsField ), PriorityField=( SmallCapsField ), TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), TaskDepartmentField=( SmallCapsField ), TaskMoveFields=( SmallCapsField, SmallCapsField ), UserStoryFields=( ?isUserStory: [ (3) ⚠input→FormField ] ), TeamPickerFieldset, FormErrorNote, SubmitButton ) }, Modal{ NewTaskForm=( (3) SmallCapsField, ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields=( [ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ] ), ?sequenceChoices.length > 0: TaskSequenceField=( SmallCapsField ), NewTaskFormFooter=( FormErrorNote, ( ?similarTasks.length > 0: SimilarTasksNotice | SubmitButton ) ) ) }, DangerConfirmModal=( DangerConfirmForm=( FormErrorNote, SubmitButton ) ) ) }
```

### `/projects/autocomplete`
`src/routes/projects/autocomplete/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), AutocompleteRegisterFilter, ( ?register.length === 0: EmptyState | ?projectsShown.length === 0: EmptyState | (n) AutocompleteProjectPanel=( DashboardPanel{ (2) (n) AutocompleteRow } ) )
```

### `/projects/kit-versions`
`src/routes/projects/kit-versions/+page.svelte`

```
WorkspaceHeader=( ⚠h1→PageTitle ), FlashMessage, DashboardPanel{ (n) KitVersionRow=( KitVersionBadge ) }
```

### `/promo`
`src/routes/promo/+page.svelte`

```
PageMeta, PromoPlayer=( PromoOverlay=( PromoCaptions=( (n) PromoCaptionHeadline ), ?!isReady: BrandSpinner, ?isWatching: ?clock.hasEnded: PromoEndCard=( DiscoveryCallButton, LineIcon ), LineIcon, PromoControls=( LineIcon, PromoChapterBar{ LineIcon } ) ) ), PromoIntro=( ⚠h1→PageTitle, DiscoveryCallButton=( ?hasCalendarIcon: LineIcon, LineIcon ) )
```

### `/tax-calculator`
`src/routes/tax-calculator/+page.svelte`

```
TakeHomePageHead=( PageMeta ), CalculatorSubNavigation, CalculatorHero=( ⚠h1→PageTitle, HeroIllustration ), SectionHeading{ TaxYearSelect=( ⚠select→FormField ) }, EarningsForm=( EarningTypeTiles=( EarningTypeIcon ), ?form.isEmployed: BigAmountField, ?form.isSelfEmployed: SelfEmploymentFields=( ( ?form.earningType === earningTyp…: BigAmountField | PeriodAmountField ), PeriodAmountField, ExpenseExamples=( DisclosureMarker ), ToggleSwitch{ ?isCisSubcontractor: PeriodAmountField } ), TaxRegionField=( ⚠select→FormField ), MoreAccurateOptions=( DisclosureMarker, PensionField=( ⚠input→FormField ), StudentLoanFields=( ⚠select→FormField ), ?form.isEmployed: PeriodAmountField, ?form.isSelfEmployed: MileageAndHomeFields=( [ (2) ⚠select→FormField ], ?form.vehicleType !== vehicleTyp…: PeriodAmountField ) ) ), TakeHomeEstimatePanel=( TakeHomePanel{ ?estimate: TakeHomeCard=( ResultPeriodToggle, ?!isLoss: ( TakeHomeDonut, SegmentLegend ), TakeHomeNote ), TakeHomeActions, EmptyTakeHome } ), ?estimate: ( BiggerPictureSection=( SectionHeading, [ WhatIfCard=( WidgetIcon, ⚠input→FormField ) LivingCostsCard=( WidgetIcon, ⚠input→FormField ) ] ), EveryPoundSection=( SectionHeading, [ BreakdownCard=( ?period === resultPeriods.quarte…: QuarterlyViewNote, BreakdownTable=( ⚠table→RecordsTable ), BandsDisclosure=( DisclosureMarker, BreakdownTable, ?nationalInsurance.length > 0: BreakdownTable ), EstimateExclusions=( DisclosureMarker ) ) YearComparisonCard ], ?isPayingHigherRates(estimate): HighIncomeNotice ), ?bill: SelfAssessmentSection=( SectionHeading, [ SelfAssessmentBillCard=( WidgetIcon, ?plan: PaymentTimeline, BreakdownTable=( ⚠table→RecordsTable ) ) ?paymentsOnAccount: PaymentsOnAccountCard=( WidgetIcon ) MakingTaxDigitalCard=( WidgetIcon, ?isInScope: QuarterlyDeadlines ) Class2Card=( WidgetIcon ) ] ) ), ComparisonsSection=( SectionHeading, (n) ComparisonCard ){ HowItWorksSection=( SectionHeading, PlainEnglishExplanations=( DisclosureMarker ), FigureSources ), ClosingStrip }, ?estimate: MobileTakeHomeBar
```

### `/terms`
`src/routes/terms/+page.svelte`

```
LegalArticle=( ⚠h1→PageTitle )
```

### `/upload/[token]`
`src/routes/upload/[token]/+page.svelte`

```
?data.taskTitle === null: PageTitle, ( PageTitle, TaskUploadZone{ SentFileList } )
```

## Components of the site

| Component | Used by | Definition |
| --- | --- | --- |
| `SubmitButton` | 69 | — |
| `FormErrorNote` | 50 | — |
| `SmallCapsField` | 29 | — |
| `WorkspaceHeader` | 16 | `⚠h1→PageTitle` |
| `DangerConfirmModal` | 11 | `DangerConfirmForm` |
| `FlashMessage` | 9 | — |
| `PageMeta` | 9 | — |
| `DiscoveryCallButton` | 8 | `?hasCalendarIcon: LineIcon, LineIcon` |
| `CopyTextButton` | 7 | — |
| `EntityLink` | 6 | — |
| `HeaderFacts` | 6 | `?facts.length > 0: (n) HeaderFact` |
| `LineIcon` | 6 | — |
| `ProjectStatusBadge` | 6 | — |
| `SectionHeading` | 6 | — |
| `WidgetIcon` | 6 | — |
| `BrandWordmark` | 5 | — |
| `DisclosureMarker` | 5 | — |
| `ProseText` | 5 | — |
| `ActionsMenu` | 4 | — |
| `DiscoveryCallSection` | 4 | `DiscoveryCallButton` |
| `PersonInitials` | 4 | — |
| `PriorityControls` | 4 | `ArrowIcon` |
| `PriorityField` | 4 | `SmallCapsField` |
| `PriorityNumberButton` | 4 | — |
| `StagePill` | 4 | — |
| `BrandSpinner` | 3 | — |
| `BreakdownTable` | 3 | `⚠table→RecordsTable` |
| `KitVersionBadge` | 3 | — |
| `LegalArticle` | 3 | `⚠h1→PageTitle` |
| `NewTaskForm` | 3 | `(3) SmallCapsField, ?!isSubtask: NewTaskStoryFields, TaskGoalAndKindFields, ?sequenceChoices.length > 0: TaskSequenceField, NewTaskFormFooter` |
| `PeriodAmountField` | 3 | — |
| `PriorityModal` | 3 | `Modal{ PriorityField, FormErrorNote, SubmitButton }` |
| `RaiseChangeButton` | 3 | `RaiseChangeModal` |
| `StatTile` | 3 | — |
| `TaskKindPill` | 3 | — |
| `TaskReferenceLink` | 3 | — |
| `AddPersonForm` | 2 | `SubmitButton` |
| `AreaCompanyList` | 2 | `(n) AreaCompanyRow` |
| `AreaCompanyPanel` | 2 | `?isOneCompany: FindJobAdvertsButton, ( ?registerStanding !== null: RegisterStandingLink \| ?canBecomeLead: [ (2) ( ProspectSeedFields, SubmitButton ) ] )` |
| `AreaLegend` | 2 | — |
| `AskClaudeToDraftApproach` | 2 | `CopyTextButton` |
| `AssignedToYouNote` | 2 | — |
| `BigAmountField` | 2 | — |
| `BlueprintHeader` | 2 | `WorkspaceHeader{ BlueprintViewSwitch, SubmitButton, HeaderFacts }` |
| `ChevronIcon` | 2 | — |
| `CompanyContextView` | 2 | `CompanyContextMap, ( ?selectedPart === undefined: EmptyState \| ContextPartPanel ), ContextConfirmationPanel, ?changes !== null: ContextChangesPanel` |
| `ConversationParticipantsPanel` | 2 | `DashboardPanel{ (n) ParticipantChip, ?outsiders.length > 0: AddParticipantForm }` |
| `ConversationThread` | 2 | `DashboardPanel{ ConversationBaton, (n) MessageRow, ConversationComposer }` |
| `CountedFilterChip` | 2 | — |
| `CoverAlbum` | 2 | — |
| `CoverSleeve` | 2 | — |
| `DeployHistoryEntry` | 2 | — |
| `EditProjectForm` | 2 | `(2) SmallCapsField, [ SmallCapsField ProjectPositionField ], OrganisationSelect, TeamProjectField, (2) SmallCapsField, [ (3) SmallCapsField ], ProjectDatabaseFields, FormErrorNote, SubmitButton` |
| `FindJobAdvertsButton` | 2 | `Modal{ AskClaudeToFindJobAdverts }` |
| `GoalHorizonField` | 2 | `SmallCapsField` |
| `GoalStatusPill` | 2 | — |
| `GroupUnderForm` | 2 | `SubmitButton` |
| `LeadOutcomeNote` | 2 | `FormErrorNote` |
| `LifecyclePanel` | 2 | `DashboardPanel{ (n) LifecycleStepItem }` |
| `McpEntryFace` | 2 | — |
| `OfferStepCard` | 2 | `?step.isMonthlyRetainer: SignalBadge` |
| `OrganisationBadge` | 2 | — |
| `OrganisationDetailsFields` | 2 | `(2) SmallCapsField, ⚠input→FormField, [ (2) ⚠input→FormField ]` |
| `OrganisationSelect` | 2 | `?organisations.length > 0: SmallCapsField` |
| `PersonFacts` | 2 | `WarmthPill` |
| `PersonFieldsForm` | 2 | `[ FormField ?contactId !== null: FormField (2) FormField PersonProfileFields ], SubmitButton` |
| `PersonLinkList` | 2 | `(n) PersonLinkChip, SubmitButton` |
| `PersonNoteTimeline` | 2 | `ProseText, SubmitButton` |
| `PersonRow` | 2 | `PersonInitials` |
| `PortalGoalRow` | 2 | `ProgressTrack` |
| `ProgressTrack` | 2 | — |
| `ProjectOrganisationCell` | 2 | `OrganisationBadge` |
| `ProjectPagination` | 2 | — |
| `ProjectTableHeader` | 2 | — |
| `ProspectSeedFields` | 2 | — |
| `RegisterStandingLink` | 2 | `StagePill` |
| `SectionCrates` | 2 | — |
| `SectorPanel` | 2 | `SectorClaimForms, SightingForm, SectorSearchForm, ?searches.length > 0: (n) SectorSearchRow` |
| `SignInLink` | 2 | — |
| `SignalBadge` | 2 | — |
| `TaskAutocompleteModal` | 2 | `Modal{ FormErrorNote, (n) TaskAutocompleteOption }` |
| `TaskDueDate` | 2 | — |
| `TaskGoalAndKindFields` | 2 | `[ SmallCapsField{ GoalSelectOptions } ?shouldOfferKind: SmallCapsField ]` |
| `TaskLinkList` | 2 | `TaskKindPill` |
| `TaskListRow` | 2 | `TaskCardHandle{ TaskRowTitle{ TaskCardActions } }, TaskCardFacts, TaskCardFooter, ?isOpen: SubtaskRows` |
| `TaskSequenceField` | 2 | `SmallCapsField` |
| `TeamMemberProfile` | 2 | — |
| `TeamProjectField` | 2 | — |
| `WarmthPill` | 2 | — |
| `Wireframe` | 2 | `WireframeNode` |
| `AboutStorySection` | 1 | `⚠h1→PageTitle` |
| `AboutTeamSection` | 1 | `(n) TeamMemberProfile` |
| `AcceptanceCriteriaSection` | 1 | `DashboardPanel{ (n) CriterionRow }, Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `AccountMenu` | 1 | `?isOpen: (n) AccountMenuGroup` |
| `AccountMenuGroup` | 1 | — |
| `AddChecklistItemForm` | 1 | `SubmitButton, FormErrorNote` |
| `AddGoalForm` | 1 | `(2) SmallCapsField, GoalHorizonField, FormErrorNote, SubmitButton` |
| `AddLeadForm` | 1 | `( ?leadKind === leadKinds.person: AddPersonForm \| SubmitButton )` |
| `AddParticipantForm` | 1 | `SubmitButton` |
| `AdminActionsMenu` | 1 | `ActionsMenu{ (3) AdminMenuAction, ?!user.isAdmin: AdminMenuAction }, SetPasswordModal` |
| `AdminMenuAction` | 1 | — |
| `AdminUserRow` | 1 | `AdminActionsMenu` |
| `AppMockup` | 1 | `AppMockupSidebar, AppMockupTiles, AppMockupCashChart, AppMockupDecisions, AppMockupOrders` |
| `AppMockupCashChart` | 1 | — |
| `AppMockupDecisions` | 1 | — |
| `AppMockupOrders` | 1 | — |
| `AppMockupSidebar` | 1 | — |
| `AppMockupTiles` | 1 | — |
| `AppointmentImportForm` | 1 | `?appointments.length > 0: [ ⚠input→FormField SubmitButton ]` |
| `AreaCompanyRow` | 1 | `?standing !== null: StagePill` |
| `AreaEventPill` | 1 | — |
| `AreaEventRow` | 1 | `AreaEventPill` |
| `AreaFeedHeader` | 1 | `[ PageTitle LiveMarker ], (2) FeedScopeChips` |
| `AreaFeedScoreboard` | 1 | `[ (4) StatTile ]` |
| `AreaMap` | 1 | — |
| `AreaMapPane` | 1 | `AreaMap, AreaLegend` |
| `AreaMapWorkspace` | 1 | `AreaMapPane{ AreaCompanyPanel, AreaCompanyList }` |
| `AreaSearchForm` | 1 | `⚠input→FormField, ⚠select→FormField, ⚠input→FormField, SubmitButton` |
| `AreaSummary` | 1 | — |
| `ArrowIcon` | 1 | — |
| `AskClaudeToFindJobAdverts` | 1 | `CopyTextButton` |
| `AskClaudeToResearch` | 1 | `?clientId === null: ⚠input→FormField, CopyTextButton` |
| `AskClaudeToResearchPerson` | 1 | `CopyTextButton` |
| `AssignProjectForm` | 1 | `FormField, (2) FormField, SubmitButton` |
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
| `BacklogFilterBar` | 1 | `CountedFilterChip{ AssigneeFilterChips{ DoneTaskFilter } }` |
| `BandsDisclosure` | 1 | `DisclosureMarker, BreakdownTable, ?nationalInsurance.length > 0: BreakdownTable` |
| `BatonStationNode` | 1 | — |
| `BatonTrack` | 1 | `(n) BatonStationNode` |
| `BeforeFirstUseNote` | 1 | — |
| `BiggerPictureSection` | 1 | `SectionHeading, [ WhatIfCard LivingCostsCard ]` |
| `BlueprintViewSwitch` | 1 | — |
| `BreakdownCard` | 1 | `?period === resultPeriods.quarte…: QuarterlyViewNote, BreakdownTable, BandsDisclosure, EstimateExclusions` |
| `BuildModelRow` | 1 | `[ (2) PointsSelect SubmitButton ], FormErrorNote` |
| `BuildModelsPanel` | 1 | `ReviewModelForm, (n) BuildModelRow, BuildModelRow` |
| `BuildingPanel` | 1 | — |
| `BuiltForSection` | 1 | `(n) ClientBusinessCard` |
| `BusinessAppSection` | 1 | `HeroChecklist, DiscoveryCallButton, (n) HeroPromiseRow, HeroMockup` |
| `CalculatorHero` | 1 | `⚠h1→PageTitle, HeroIllustration` |
| `CalculatorSubNavigation` | 1 | — |
| `CaseStudyBusinessSection` | 1 | `CaseStudyOutcomes` |
| `CaseStudyIntroSection` | 1 | `⚠h1→PageTitle` |
| `CaseStudyMethodSection` | 1 | — |
| `CaseStudyOutcomes` | 1 | — |
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
| `CompanyPlaceFields` | 1 | `(2) FormField` |
| `CompanyProfileForm` | 1 | `[ FormField CompanyPlaceFields FormField CompanyScaleFields ], CompanyNarrativeFields, SubmitButton` |
| `CompanyScaleFields` | 1 | `(2) FormField` |
| `ComparisonCard` | 1 | — |
| `ComparisonsSection` | 1 | `SectionHeading, (n) ComparisonCard` |
| `CompletionBar` | 1 | — |
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
| `DemoActivityRow` | 1 | — |
| `DemoActivitySection` | 1 | `(n) DemoActivityRow, SubmitButton` |
| `DemoBrainSection` | 1 | — |
| `DemoConnectSection` | 1 | `⚠h1→PageTitle, CopyTextButton` |
| `DemoKindChoiceCard` | 1 | `SubmitButton` |
| `DemoLinkedSystemRow` | 1 | — |
| `DemoLinkedSystemsSection` | 1 | `(n) DemoLinkedSystemRow` |
| `DemoMoneySection` | 1 | — |
| `DemoOwnSystemSection` | 1 | — |
| `DemoQuestionsSection` | 1 | — |
| `DemoStartSection` | 1 | `⚠h1→PageTitle, (n) DemoKindChoiceCard, FormErrorNote` |
| `DepartmentTabs` | 1 | — |
| `DeployHistoryFilterBar` | 1 | `(2) ⚠input→FormField` |
| `DeployHistoryPanel` | 1 | `DashboardPanel{ (n) DeployHistoryEntry }` |
| `DeployNowButton` | 1 | — |
| `DiscoveryCallForm` | 1 | `[ (6) FormField ], FormField, ⚠input→FormField, FormErrorNote, SubmitButton` |
| `DiscoveryCallThankYou` | 1 | — |
| `DisplayNameForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `DocumentProse` | 1 | — |
| `DomainContextBox` | 1 | — |
| `DomainEntityNode` | 1 | — |
| `DomainExplorer` | 1 | `DomainMap, ( ?chosenEntity === undefined: EmptyState \| EntityPanel )` |
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
| `EntityPanel` | 1 | `DashboardPanel{ RaiseChangeButton, EntityPlacement, EntityFieldList, ?relationships.length > 0: EntityRelationshipList, ?screens.length > 0: EntityScreenLinks }` |
| `EntityPlacement` | 1 | `EntityLink` |
| `EntityRelationshipList` | 1 | `EntityLink` |
| `EntityScreenLinks` | 1 | — |
| `EstimateExclusions` | 1 | `DisclosureMarker` |
| `EveryPoundSection` | 1 | `SectionHeading, [ BreakdownCard YearComparisonCard ], ?isPayingHigherRates(estimate): HighIncomeNotice` |
| `ExpenseExamples` | 1 | `DisclosureMarker` |
| `FeedDaySection` | 1 | — |
| `FeedScopeChips` | 1 | — |
| `FigureSources` | 1 | — |
| `FinishedProjectsToggle` | 1 | — |
| `GoalAutocompletePanel` | 1 | `DashboardPanel{ ?canSwitch: SubmitButton, FormErrorNote }` |
| `GoalDetailHeader` | 1 | `WorkspaceHeader{ GoalStatusPill, HeaderFacts }` |
| `GoalList` | 1 | `(n) GoalRow` |
| `GoalListPanel` | 1 | `DashboardPanel{ GoalStatusFilter, GoalList }, Modal{ AddGoalForm }, ?priorityGoal !== null: PriorityModal` |
| `GoalMeasurePanel` | 1 | `DashboardPanel{ ProseText }` |
| `GoalRow` | 1 | `[ [ PriorityControls PriorityNumberButton ] ( ?!isOpen: GoalStatusPill, ?shouldShowCompletion: ProgressTrack ) ]` |
| `GoalSelectOptions` | 1 | — |
| `GoalStatusFilter` | 1 | — |
| `GoalTaskList` | 1 | `DashboardPanel{ TaskLinkList }` |
| `GoogleSignInButton` | 1 | — |
| `GuideDetails` | 1 | — |
| `HandOffPicker` | 1 | `(2) ⚠select→FormField` |
| `HeaderFact` | 1 | — |
| `HeroChecklist` | 1 | `(n) LineIcon` |
| `HeroIllustration` | 1 | — |
| `HeroMockup` | 1 | `AppMockup, AssistantPhoneMockup` |
| `HeroPromiseRow` | 1 | `LineIcon, ?hasBadge: SignalBadge` |
| `HeroSection` | 1 | `[ ⚠h1→PageTitle BrandWordmark ]` |
| `HighIncomeNotice` | 1 | — |
| `HowItWorksSection` | 1 | `SectionHeading, PlainEnglishExplanations, FigureSources` |
| `ImageThumbnail` | 1 | — |
| `InviteMemberForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `InvitePersonForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `InvoicingDetailsPanel` | 1 | `DashboardPanel, Modal{ OrganisationDetailsForm }` |
| `JobAdvertRow` | 1 | — |
| `KitVersionRow` | 1 | `KitVersionBadge` |
| `LifecycleBadgeChip` | 1 | — |
| `LifecycleStepItem` | 1 | — |
| `LiveMarker` | 1 | — |
| `LivingCostsCard` | 1 | `WidgetIcon, ⚠input→FormField` |
| `MakingTaxDigitalCard` | 1 | `WidgetIcon, ?isInScope: QuarterlyDeadlines` |
| `MarkAllReadForm` | 1 | `SubmitButton` |
| `McpEntryCover` | 1 | `CoverSleeve{ McpEntryFace }` |
| `McpEntryDetails` | 1 | `DashboardPanel{ RaiseChangeButton, McpEntryFace, ( ?entry.kind === mcpEntryKinds.to…: ToolDoors \| GuideDetails ) }` |
| `McpMapBrowser` | 1 | `SectionCrates{ CoverAlbum{ McpEntryCover }, ?chosenEntry !== undefined: McpEntryDetails }` |
| `MessageRow` | 1 | `ProseText` |
| `MileageAndHomeFields` | 1 | `[ (2) ⚠select→FormField ], ?form.vehicleType !== vehicleTyp…: PeriodAmountField` |
| `MobileMenuButton` | 1 | — |
| `MobileNavDrawer` | 1 | `(n) MobileNavGroup` |
| `MobileNavGroup` | 1 | — |
| `MobileTakeHomeBar` | 1 | — |
| `ModalHeader` | 1 | — |
| `MoreAccurateOptions` | 1 | `DisclosureMarker, PensionField, StudentLoanFields, ?form.isEmployed: PeriodAmountField, ?form.isSelfEmployed: MileageAndHomeFields` |
| `NameDirectorForm` | 1 | `⚠select→FormField` |
| `NavigationSpinner` | 1 | `?slowNavigation.isActive: BrandSpinner` |
| `NewContactForm` | 1 | `(4) FormField, SubmitButton` |
| `NewOrganisationForm` | 1 | `OrganisationDetailsFields, FormErrorNote, SubmitButton` |
| `NewProjectForm` | 1 | `(2) SmallCapsField, OrganisationSelect, TeamProjectField, FormErrorNote, SubmitButton` |
| `NewTaskFormFooter` | 1 | `FormErrorNote, ( ?similarTasks.length > 0: SimilarTasksNotice \| SubmitButton )` |
| `NewTaskStoryFields` | 1 | — |
| `NotificationRow` | 1 | `SubmitButton` |
| `NotificationsBell` | 1 | — |
| `ObservationRow` | 1 | — |
| `OfferStepsSection` | 1 | `⚠h1→PageTitle, (n) OfferStepCard, DiscoveryCallButton` |
| `OfferTermsSection` | 1 | `DiscoveryCallButton` |
| `OfficerResultList` | 1 | `SubmitButton` |
| `OfficerSearchForm` | 1 | `SubmitButton` |
| `OrganisationDetailsForm` | 1 | `OrganisationDetailsFields, FormErrorNote, SubmitButton` |
| `OrganisationDirectorRow` | 1 | `PersonInitials` |
| `OrganisationDirectorsPanel` | 1 | `DashboardPanel{ (n) OrganisationDirectorRow, ?canNameAnother: NameDirectorForm }` |
| `OrganisationFilterChips` | 1 | — |
| `OrganisationMemberRow` | 1 | `PersonInitials` |
| `OrganisationModuleRow` | 1 | — |
| `OrganisationModulesPanel` | 1 | `?shownModules.length > 0: DashboardPanel{ (n) OrganisationModuleRow }` |
| `OrganisationPeoplePanel` | 1 | `DashboardPanel{ (n) OrganisationMemberRow }, Modal{ InviteMemberForm }, ?memberAwaitingRemoval !== null: DangerConfirmModal` |
| `OrganisationProjectRow` | 1 | `ProjectStatusBadge` |
| `OrganisationProjectsPanel` | 1 | `DashboardPanel{ (n) OrganisationProjectRow }` |
| `OrganisationRegister` | 1 | `(n) OrganisationRow` |
| `OrganisationRow` | 1 | — |
| `OrganisationsPageHeader` | 1 | `WorkspaceHeader` |
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
| `PensionField` | 1 | `⚠input→FormField` |
| `PeopleTable` | 1 | `(n) PersonRow` |
| `PersonCard` | 1 | `?canInvite: SubmitButton, PersonFacts, PersonLinkList, PersonNoteTimeline` |
| `PersonCompanyCard` | 1 | `StagePill, ?company.parentName === '': GroupUnderForm` |
| `PersonCompanyList` | 1 | `(n) PersonCompanyCard` |
| `PersonEventLedger` | 1 | — |
| `PersonHeader` | 1 | `PageTitle, PersonFacts` |
| `PersonLinkChip` | 1 | — |
| `PersonProfileFields` | 1 | `(5) FormField` |
| `PlainEnglishExplanations` | 1 | `DisclosureMarker` |
| `PointsSelect` | 1 | `⚠select→FormField` |
| `PortalClaudeAbilities` | 1 | `DashboardPanel` |
| `PortalClaudePlanRow` | 1 | — |
| `PortalClaudePlanSteps` | 1 | `DashboardPanel{ (n) PortalClaudePlanRow }` |
| `PortalConnectorAddress` | 1 | `DashboardPanel{ CopyTextButton }` |
| `PortalContextPrompt` | 1 | `DashboardPanel{ CopyTextButton }` |
| `PortalEnvironmentLink` | 1 | — |
| `PortalGoalList` | 1 | `DashboardPanel{ ?goals.length > 0: (n) PortalGoalRow }` |
| `PortalHeader` | 1 | `[ BrandWordmark ?isSignedIn: SubmitButton ?!isSignedIn: SignInLink ]` |
| `PortalInviteForm` | 1 | `DashboardPanel{ (3) SmallCapsField, FormErrorNote, SubmitButton }` |
| `PortalOrganisationSwitch` | 1 | `DashboardPanel{ FormErrorNote, SubmitButton }` |
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
| `ProjectActionsMenu` | 1 | `ActionsMenu` |
| `ProjectBoard` | 1 | `ProjectFilterBar, ( ProjectTable, ProjectPagination )` |
| `ProjectBoardTabs` | 1 | `OrganisationFilterChips, TabStrip, ( ?isTeamTab: TeamProjectsSection \| ProjectBoard )` |
| `ProjectDashboard` | 1 | `ProjectStatePanel, ProjectPulseStrip, PanelTabs, TaskTreePanel, StagedTasksPanel, DeployHistoryPanel, (2) GoalListPanel, ProjectPeoplePanel` |
| `ProjectDatabaseFields` | 1 | `[ SmallCapsField ?hasDatabase: SmallCapsField ], ?isAzureSql: [ (3) SmallCapsField ]` |
| `ProjectDetailHeader` | 1 | `WorkspaceHeader{ ProjectStatusBadge, OrganisationBadge, KitVersionBadge, ProjectHeaderMenu{ HeaderFacts } }, Modal{ EditProjectForm }` |
| `ProjectEditModals` | 1 | `Modal{ EditProjectForm }, DangerConfirmModal` |
| `ProjectFilterBar` | 1 | `FinishedProjectsToggle` |
| `ProjectHeaderMenu` | 1 | `ActionsMenu{ DeployNowButton }` |
| `ProjectPeoplePanel` | 1 | `DashboardPanel{ (n) PersonRow }, Modal{ InvitePersonForm }, Modal{ TransferOwnershipForm }, ?personAwaitingRemoval !== null: DangerConfirmModal` |
| `ProjectPositionField` | 1 | `PriorityField` |
| `ProjectPulseStrip` | 1 | `[ (4) StatTile ]` |
| `ProjectRow` | 1 | `ProjectTaskTally, [ PriorityControls PriorityNumberButton ], ProjectStatusBadge, ProjectOrganisationCell, KitVersionBadge, ProjectStatusBadge, ?project.taskCount > 0: CompletionBar, ProjectActionsMenu` |
| `ProjectStatePanel` | 1 | `DashboardPanel` |
| `ProjectTable` | 1 | `ProjectTableHeader, ProjectRow` |
| `ProjectTaskTally` | 1 | `AssignedToYouNote` |
| `ProjectsPageHeader` | 1 | `WorkspaceHeader` |
| `PromoCaptionHeadline` | 1 | — |
| `PromoCaptions` | 1 | `(n) PromoCaptionHeadline` |
| `PromoChapterBar` | 1 | — |
| `PromoControls` | 1 | `LineIcon, PromoChapterBar{ LineIcon }` |
| `PromoEndCard` | 1 | `DiscoveryCallButton, LineIcon` |
| `PromoIntro` | 1 | `⚠h1→PageTitle, DiscoveryCallButton` |
| `PromoOverlay` | 1 | `PromoCaptions, ?!isReady: BrandSpinner, ?isWatching: ?clock.hasEnded: PromoEndCard, LineIcon, PromoControls` |
| `PromoPlayer` | 1 | `PromoOverlay` |
| `ProspectResultTable` | 1 | `[ (2) ( ProspectSeedFields, SubmitButton ) ]` |
| `ProspectSearchForm` | 1 | `(2) ⚠input→FormField, SubmitButton` |
| `QuarterlyDeadlines` | 1 | — |
| `QuarterlyViewNote` | 1 | — |
| `RaiseChangeModal` | 1 | `Modal{ NewTaskForm }` |
| `RenameChecklistModal` | 1 | `Modal{ SmallCapsField, FormErrorNote, SubmitButton }` |
| `ResolveSupportTaskForm` | 1 | `FormErrorNote, SubmitButton` |
| `ResultPeriodToggle` | 1 | — |
| `ReviewModelForm` | 1 | `[ ⚠select→FormField SubmitButton FormErrorNote ]` |
| `ScreenCover` | 1 | `CoverSleeve{ Wireframe }` |
| `ScreenDetails` | 1 | `DashboardPanel{ RaiseChangeButton, Wireframe, ?mcpMap !== null: ScreenTools }` |
| `ScreenTools` | 1 | — |
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
| `SimilarTasksNotice` | 1 | — |
| `SiteFooter` | 1 | `BrandWordmark` |
| `SiteHeader` | 1 | `[ BrandWordmark [ ?isSignedIn: NotificationsBell ?!isSignedIn: ( SignInLink, DiscoveryCallButton ) AccountMenu ] [ ?isSignedIn: NotificationsBell MobileMenuButton ] ], ?isMobileMenuOpen: MobileNavDrawer` |
| `SiteMapBrowser` | 1 | `SectionCrates{ CoverAlbum{ ScreenCover }, ?chosenScreen !== undefined: ScreenDetails }` |
| `StageDots` | 1 | — |
| `StageFilterTabs` | 1 | — |
| `StagedTaskRow` | 1 | — |
| `StagedTasksPanel` | 1 | `DashboardPanel{ (n) StagedTaskRow }` |
| `StudentLoanFields` | 1 | `⚠select→FormField` |
| `SubtaskList` | 1 | `DashboardPanel{ TaskLinkList }` |
| `SubtaskRows` | 1 | `(n) TaskListRow` |
| `SupportTaskFacts` | 1 | `?task.resolution !== '': ProseText` |
| `SupportTaskTable` | 1 | — |
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
| `TaskComplexityCount` | 1 | `⚠input→FormField` |
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
| `TaxRegionField` | 1 | `⚠select→FormField` |
| `TaxYearSelect` | 1 | `⚠select→FormField` |
| `TeamPickerFieldset` | 1 | — |
| `TeamProjectRow` | 1 | `AssignedToYouNote, [ PriorityControls PriorityNumberButton ], ProjectStatusBadge, ProjectOrganisationCell, ProjectStatusBadge` |
| `TeamProjectTable` | 1 | `ProjectTableHeader, (n) TeamProjectRow` |
| `TeamProjectsSection` | 1 | `TeamProjectTable` |
| `TeamSection` | 1 | `(n) TeamMemberProfile` |
| `ToActOnSection` | 1 | — |
| `TodoStatusForm` | 1 | — |
| `ToggleSwitch` | 1 | — |
| `ToolDoors` | 1 | `(n) PairedScreenLink` |
| `TransferOwnershipForm` | 1 | `SmallCapsField, FormErrorNote, SubmitButton` |
| `UserStoryFields` | 1 | `?isUserStory: [ (3) ⚠input→FormField ]` |
| `WaitingOnYouSection` | 1 | `ToActOnSection{ (n) WaitingTaskRow }` |
| `WaitingTaskRow` | 1 | — |
| `WhatIfCard` | 1 | `WidgetIcon, ⚠input→FormField` |
| `WhatWeDoSection` | 1 | `(n) OfferStepCard, [ DiscoveryCallButton BrandWordmark ]` |
| `WireframeNode` | 1 | `?depth <= deepestDrawn: (n) ( ?isContainer: (n) Self \| WireframeShape )` |
| `WireframeShape` | 1 | — |
| `YearComparisonCard` | 1 | — |
| `+error` | 0 | `PageTitle` |
| `+layout` | 0 | `NavigationSpinner, ?isPortal: PortalHeader, ?!isPortal: SiteHeader, SiteFooter` |
| `+page` | 0 | `PageMeta, HeroSection, BusinessAppSection, WhatWeDoSection, BuiltForSection, TeamSection, DiscoveryCallSection` |
