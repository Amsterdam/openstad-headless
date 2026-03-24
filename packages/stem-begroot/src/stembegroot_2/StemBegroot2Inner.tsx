//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Paginator, Spacer, Stepper } from '@openstad-headless/ui/src';
import { Filters } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import '@utrecht/component-library-css';
import { Heading } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useState } from 'react';

import NotificationProvider from '../../../lib/NotificationProvider/notification-provider';
import '../stem-begroot.css';
import { createSelectedResourcesStorage } from '../utils/selected-resources-storage';
import { createVotePendingStorage } from '../utils/vote-pending-storage';
import { BudgetUsedBar } from './components/BudgetUsedBar';
import { FilterableResourceGrid } from './components/FilterableResourceGrid';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { StemBegrootNavigation } from './components/StemBegrootNavigation';
import { StemCodeRedirectStep } from './components/StemCodeRedirectStep';
import { StemCodeSuccessBanner } from './components/StemCodeSuccessBanner';
import { Step1ChosenResourcesPanel } from './components/Step1ChosenResourcesPanel';
import { Step2SelectionReview } from './components/Step2SelectionReview';
import { ThemePickerStep } from './components/ThemePickerStep';
import { VoteFinishedStep } from './components/VoteFinishedStep';
import { useStemBegroot2Selections } from './hooks/useStemBegroot2Selections';
import { useStemBegroot2VoteFlow } from './hooks/useStemBegroot2VoteFlow';
import type { StemBegroot2WidgetProps } from './types';

function StemBegroot2Inner({
  notEnoughBudgetText = 'Niet genoeg budget',
  onlyIncludeTagIds = '',
  onlyIncludeStatusIds = '',
  resourceListColumns = 3,
  step1Tab = '',
  step2Tab = '',
  step3Tab = '',
  step4Tab = '',
  step0 = '',
  overviewTitle = '',
  step3Title = '',
  hideTagsForResources = false,
  hideReadMore = false,
  scrollWhenMaxReached = false,
  step1Delete = 'Verwijder',
  step1Add = 'Voeg toe',
  step1MaxText = '',
  filterBehavior = 'or',
  voteAfterLoggingIn = false,
  displayModBreak = false,
  ...props
}: StemBegroot2WidgetProps) {
  const votePendingStorage = React.useMemo(
    () => createVotePendingStorage(props.projectId),
    [props.projectId]
  );

  const selectedResourcesStorage = React.useMemo(
    () => createSelectedResourcesStorage(props.projectId),
    [props.projectId]
  );

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const { data: allTags = [] } = datastore.useTags({
    projectId: props.projectId,
    type: '',
  });

  const startingStep =
    props?.votes?.voteType === 'countPerTag' ||
    props?.votes?.voteType === 'budgetingPerTag'
      ? -1
      : 0;

  const [currentStep, setCurrentStep] = useState<number>(startingStep);
  const [lastStep, setLastStep] = useState<number>(0);
  const { data: currentUser } = datastore.useCurrentUser({ ...props });

  const {
    tagIdsToLimitResourcesTo,
    initStatuses,
    prefilterTagObj,
    typeSelector,
    tagsToDisplay,
    tags,
    setTags,
    sort,
    setSort,
    randomSortSeed,
    search,
    setSearch,
    page,
    setPage,
    itemsPerPage,
    totalPages,
    filteredResources,
    setFilteredResources,
    resourcesToUse,
    resources,
    submitVotes,
    openDetailDialog,
    setOpenDetailDialog,
    resourceDetailIndex,
    selectedResources,
    setSelectedResources,
    tagCounter,
    setTagCounter,
    activeTagTab,
    setActiveTagTab,
    visitedTagTabs,
    resourceSelectable,
    createItemBtnString,
    getOriginalResourceUrl,
    onResourcePlainClicked,
    onResourcePrimaryClicked,
    onSelectedResourceRemove,
    decideCanAddMore,
    budgetUsed,
    selectedBudgets,
    step1ContainerRef,
    scrollToElement,
    scrollToTop,
  } = useStemBegroot2Selections({
    props,
    onlyIncludeTagIds,
    onlyIncludeStatusIds,
    datastore,
    allTags,
    selectedResourcesStorage,
    votePendingStorage,
    scrollWhenMaxReached,
    step1Delete,
    step1Add,
    notEnoughBudgetText,
  });

  const usedBudgetList = (
    <BudgetUsedBar
      budgetUsed={budgetUsed}
      maxBudget={props.votes.maxBudget}
      selectedBudgets={selectedBudgets}
    />
  );

  const steps = [
    step1Tab || 'Kies',
    step2Tab || 'Overzicht',
    step3Tab || 'Stemcode',
    step4Tab || 'Stem',
  ];

  const { handleNextClick, nextButtonDisabled, nextButtonLabel } =
    useStemBegroot2VoteFlow({
      props,
      currentUser,
      currentStep,
      setCurrentStep,
      selectedResources,
      setSelectedResources,
      tagCounter,
      setTagCounter,
      activeTagTab,
      setActiveTagTab,
      visitedTagTabs,
      votePendingStorage,
      selectedResourcesStorage,
      resources,
      submitVotes,
      voteAfterLoggingIn,
    });

  // Force step skipping in simple view
  useEffect(() => {
    if (props.isSimpleView && currentStep === 1 && lastStep > currentStep) {
      setCurrentStep(0); // Skip step 2
    } else if (
      props.isSimpleView &&
      currentStep === 1 &&
      lastStep < currentStep
    ) {
      setCurrentStep(2); // Skip step 2
    }

    if (currentStep !== lastStep) {
      setLastStep(currentStep);
    }
  }, [props.isSimpleView, currentStep, lastStep]);

  return (
    <>
      <ResourceDetailModal
        areaId={props.map.areaId}
        displayPriceLabel={props.displayPriceLabel}
        displayRanking={props.displayRanking}
        showVoteCount={props.showVoteCount}
        showOriginalResource={props.showOriginalResource ?? true}
        originalResourceUrl={props.originalResourceUrl}
        displayTitle={props.displayTitle ?? true}
        displaySummary={props.displaySummary ?? true}
        displayDescription={props.displayDescription ?? true}
        resources={resourcesToUse}
        resourceBtnEnabled={resourceSelectable}
        resourceBtnTextHandler={createItemBtnString}
        defineOriginalUrl={getOriginalResourceUrl}
        openDetailDialog={openDetailDialog}
        setOpenDetailDialog={setOpenDetailDialog}
        isSimpleView={Boolean(props.isSimpleView)}
        onPrimaryButtonClick={onResourcePrimaryClicked}
        resourceDetailIndex={resourceDetailIndex}
        statusIdsToLimitResourcesTo={initStatuses}
        tagIdsToLimitResourcesTo={tags}
        sort={sort}
        allTags={allTags}
        tags={tags}
        setFilteredResources={setFilteredResources}
        filteredResources={filteredResources}
        voteType={props?.votes?.voteType || 'likes'}
        typeSelector={typeSelector}
        activeTagTab={activeTagTab}
        randomSortSeed={randomSortSeed}
        currentPage={page}
        pageSize={itemsPerPage}
        filterBehavior={filterBehavior}
        displayModBreak={displayModBreak}
        modBreakTitle={props?.resources?.modbreakTitle || ''}
      />

      <div className="osc">
        <Stepper
          currentStep={currentStep}
          steps={steps}
          isSimpleView={props.isSimpleView}
        />
        <Spacer size={1} />

        {props.votes.voteType === 'budgeting' ||
        props?.votes?.voteType === 'budgetingPerTag' ? (
          <>
            {usedBudgetList}
            <Spacer size={1.5} />
          </>
        ) : null}

        <section className="begroot-step-panel" ref={step1ContainerRef as any}>
          {currentStep === -1 && (
            <ThemePickerStep
              step0Html={step0}
              tagsToDisplay={tagsToDisplay}
              onPickTheme={(tag) => {
                setActiveTagTab(tag);
                setCurrentStep(0);
              }}
            />
          )}

          {currentStep === 0 ? (
            <Step1ChosenResourcesPanel
              panelTitle={props.panelTitle}
              budgetChosenTitle={props.budgetChosenTitle}
              budgetRemainingTitle={props.budgetRemainingTitle}
              step1Title={props.step1Title}
              resourceCardTitle={props.resourceCardTitle}
              introText={props.step1}
              showInfoMenu={props.showInfoMenu}
              maxBudget={props.votes.maxBudget}
              allResourceInList={resources?.records}
              selectedResources={selectedResources}
              maxNrOfResources={props.votes.maxResources || 0}
              typeIsBudgeting={
                props.votes.voteType === 'budgeting' ||
                props.votes.voteType === 'budgetingPerTag'
              }
              tagsToDisplay={tagsToDisplay}
              activeTagTab={activeTagTab}
              setActiveTagTab={setActiveTagTab}
              typeIsPerTag={
                props?.votes?.voteType === 'countPerTag' ||
                props?.votes?.voteType === 'budgetingPerTag'
              }
              tagCounter={tagCounter}
              step1MaxText={step1MaxText}
              onSelectedResourceRemove={onSelectedResourceRemove}
              decideCanAddMore={decideCanAddMore}
            />
          ) : null}

          {currentStep === 1 ? (
            <>
              <Spacer size={1.5} />
              <Step2SelectionReview
                panelTitle={props.panelTitle}
                budgetChosenTitle={props.budgetChosenTitle}
                budgetRemainingTitle={props.budgetRemainingTitle}
                step2Title={props.step2Title}
                introText={props.step2}
                budgetUsed={budgetUsed}
                selectedResources={selectedResources}
                maxBudget={props.votes.maxBudget}
                maxNrOfResources={props.votes.maxResources || 0}
                typeIsBudgeting={
                  props.votes.voteType === 'budgeting' ||
                  props.votes.voteType === 'budgetingPerTag'
                }
                typeIsPerTag={
                  props?.votes?.voteType === 'countPerTag' ||
                  props?.votes?.voteType === 'budgetingPerTag'
                }
                tagCounter={tagCounter}
                showInfoMenu={props.showInfoMenu}
              />
            </>
          ) : null}

          {currentStep === 2 ? (
            <StemCodeRedirectStep
              loginUrl={`${props?.login?.url}`}
              step3={props.step3 || ''}
              stemCodeTitle={props.stemCodeTitle}
              step3Title={step3Title || ''}
              projectId={props.projectId}
              voteType={props.votes.voteType}
              apiUrl={props?.api?.url || ''}
            />
          ) : null}

          {currentStep === 3 ? (
            <StemCodeSuccessBanner step3success={props.step3success || ''} />
          ) : null}

          <Spacer size={1} />

          {currentStep === 4 ? (
            <VoteFinishedStep
              thankMessage={props.thankMessage || ''}
              voteMessage={props.voteMessage || ''}
            />
          ) : null}

          <StemBegrootNavigation
            currentStep={currentStep}
            stemCodeTitleSuccess={props.stemCodeTitleSuccess}
            loginUrlForStemCodeSuccess={`${props?.login?.url}`}
            showNewsletterButton={props.showNewsletterButton}
            newsLetterTitle={props.newsLetterTitle}
            newsLetterLink={props.newsLetterLink}
            onPrev={() => setCurrentStep(currentStep - 1)}
            onNext={handleNextClick}
            nextDisabled={nextButtonDisabled}
            nextLabel={nextButtonLabel}
          />
        </section>

        {currentStep === 0 ? (
          <>
            <FilterableResourceGrid
              header={
                <>
                  <Heading level={1} appearance="utrecht-heading-3">
                    {overviewTitle || 'Plannen'}
                  </Heading>
                  <Spacer size={1} />
                  {datastore ? (
                    <Filters
                      tagsLimitation={tagIdsToLimitResourcesTo}
                      dataStore={datastore}
                      sorting={props.sorting || []}
                      defaultSorting={props.defaultSorting || ''}
                      displaySorting={props.displaySorting || false}
                      displaySearch={props.displaySearch || false}
                      displayTagFilters={props.displayTagFilters || false}
                      searchPlaceholder={props.searchPlaceholder || 'Zoeken'}
                      resetText={props.resetText || 'Reset'}
                      applyText={props.applyText || 'Toepassen'}
                      tagGroups={props.tagGroups || []}
                      itemsPerPage={itemsPerPage}
                      resources={resources}
                      onUpdateFilter={(f) => {
                        if (f.tags.length === 0) {
                          setTags(tagIdsToLimitResourcesTo);
                        } else {
                          setTags(f.tags);
                        }
                        setSort(f.sort);
                        setSearch(f.search.text);
                      }}
                      preFilterTags={prefilterTagObj}
                    />
                  ) : null}
                  <Spacer size={1} />
                </>
              }
              defineOriginalUrl={getOriginalResourceUrl}
              resourceBtnEnabled={resourceSelectable}
              resourceBtnTextHandler={createItemBtnString}
              resources={resources?.records?.length ? resources?.records : []}
              selectedResources={selectedResources}
              onResourcePlainClicked={onResourcePlainClicked}
              displayPriceLabel={props.displayPriceLabel}
              displayRanking={props.displayRanking}
              showVoteCount={props.showVoteCount}
              showOriginalResource={props.showOriginalResource ?? true}
              originalResourceUrl={props.originalResourceUrl}
              displayTitle={props.displayTitle ?? true}
              displaySummary={props.displaySummary ?? true}
              resourceListColumns={resourceListColumns || 3}
              onResourcePrimaryClicked={onResourcePrimaryClicked}
              statusIdsToLimitResourcesTo={initStatuses}
              tagIdsToLimitResourcesTo={tags}
              sort={sort}
              allTags={allTags}
              tags={tags}
              activeTagTab={activeTagTab}
              setFilteredResources={setFilteredResources}
              filteredResources={filteredResources}
              voteType={props?.votes?.voteType || 'likes'}
              typeSelector={typeSelector}
              randomSortSeed={randomSortSeed}
              hideTagsForResources={hideTagsForResources}
              hideReadMore={hideReadMore}
              currentPage={page}
              pageSize={itemsPerPage}
              filterBehavior={filterBehavior}
            />

            <Spacer size={3} />

            {props.displayPagination && (
              <div className="osc-stem-begroot-paginator">
                <Paginator
                  page={page || 0}
                  totalPages={totalPages || 1}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    scrollToTop();
                  }}
                />
              </div>
            )}

            <Spacer size={2} />
          </>
        ) : null}

        <NotificationProvider />
      </div>
    </>
  );
}

StemBegroot2Inner.loadWidget = loadWidget;

export { StemBegroot2Inner };
