import {
  canLikeResource,
  getScopedSessionRandomSortSeed,
} from '@openstad-headless/lib';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { StemBegroot2WidgetProps, TagType } from '../types';

type UseStemBegroot2SelectionsArgs = {
  props: StemBegroot2WidgetProps;
  onlyIncludeTagIds: string;
  onlyIncludeStatusIds?: string;
  datastore: any;
  allTags: Array<any>;
  selectedResourcesStorage: any;
  votePendingStorage: any;
  scrollWhenMaxReached: boolean;
  step1Delete: string;
  step1Add: string;
  notEnoughBudgetText: string;
};

export function useStemBegroot2Selections({
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
}: UseStemBegroot2SelectionsArgs) {
  const stringToArray = (str: string) => {
    return str
      .trim()
      .split(',')
      .filter((t) => t && !isNaN(+t.trim()))
      .map((t) => Number.parseInt(t));
  };

  const tagIdsToLimitResourcesTo = stringToArray(onlyIncludeTagIds);
  const statusIdsToLimitResourcesTo = stringToArray(onlyIncludeStatusIds || '');

  const urlParams = new URLSearchParams(window.location.search);
  const urlTagIds = urlParams.get('tagIds');
  const urlStatusIds = urlParams.get('statusIds');

  const urlTagIdsArray = urlTagIds ? stringToArray(urlTagIds) : undefined;
  const urlStatusIdsArray = urlStatusIds
    ? stringToArray(urlStatusIds)
    : undefined;

  const initTags =
    urlTagIdsArray && urlTagIdsArray.length > 0
      ? urlTagIdsArray
      : tagIdsToLimitResourcesTo || [];

  const initStatuses =
    urlStatusIdsArray && urlStatusIdsArray.length > 0
      ? urlStatusIdsArray
      : statusIdsToLimitResourcesTo || [];

  const prefilterTagObj =
    urlTagIdsArray && allTags
      ? allTags.filter((tag: { id: number }) => urlTagIdsArray.includes(tag.id))
      : [];

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

  const [activeTagTab, setActiveTagTab] = useState<string>('');
  const [visitedTagTabs, setVisitedTagTabs] = useState<Array<string>>([]);

  const [selectedResources, setSelectedResources] = useState<any[]>(() => {
    const stored = selectedResourcesStorage.getSelectedResources();
    return stored || [];
  });

  const [tagCounter, setTagCounter] = useState<Array<TagType>>([]);
  const [tags, setTags] = useState<number[]>(initTags);

  const [sort, setSort] = useState<string | undefined>(
    props.defaultSorting || undefined
  );

  const randomSortSeed = useMemo(() => {
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const seedScope = `${props.projectId || 'project'}:${pathname}:${search}`;
    return getScopedSessionRandomSortSeed(
      seedScope,
      'stemBegrootRandomSortSeed'
    );
  }, [props.projectId]);

  const [search, setSearch] = useState<string | undefined>();
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage] = useState<number>(props.itemsPerPage || 999);
  const [totalPages, setTotalPages] = useState(0);

  const { data: resources, submitVotes } = datastore.useResources({
    projectId: props.projectId,
    tags,
    sort: sort === 'random' ? undefined : sort,
    search,
    pageSize: 999,
  });

  const typeSelector = props.tagTypeSelector || 'tag';
  const tagsToDisplay =
    typeSelector === 'tag'
      ? allTags
          .filter((tag: { type: string }) => tag.type === props.tagTypeTag)
          .map((tag: { name: string }) => tag.name)
      : props.tagTypeTagGroup || [];

  // Initialize per-tag vote counters
  useEffect(() => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      if (
        tagsToDisplay.length > 0 &&
        (!Array.isArray(tagCounter) ||
          (Array.isArray(tagCounter) && tagCounter.length === 0))
      ) {
        const numberOrDefault = (value: any, defaultValue: number) => {
          const parsedValue = Number(value);
          return !isNaN(parsedValue) ? parsedValue : defaultValue;
        };

        const tagCounterNew: Array<TagType> = tagsToDisplay.map(
          (tag: string) => {
            return {
              [tag]: {
                min:
                  props.votes.voteType === 'countPerTag'
                    ? numberOrDefault(props.votes.minResources, 1)
                    : numberOrDefault(props.votes.minBudget, 1),
                max:
                  props.votes.voteType === 'countPerTag'
                    ? props.votes.maxResources || 1
                    : props.votes.maxBudget || 1,
                current: 0,
                selectedResources: [],
              },
            };
          }
        );

        setTagCounter(tagCounterNew);
      }
    }
  }, [tagsToDisplay]);

  // Keep selectedResources in sync for per-tag views
  useEffect(() => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      if (activeTagTab) {
        const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
        if (activeTag) {
          setSelectedResources(activeTag[activeTagTab].selectedResources);
        }
      }
    }
  }, [activeTagTab]);

  // Persist selection to localStorage when not per-tag
  useEffect(() => {
    if (
      props.votes.voteType !== 'countPerTag' &&
      props.votes.voteType !== 'budgetingPerTag'
    ) {
      selectedResourcesStorage.setSelectedResources(selectedResources);
    }
  }, [selectedResources, selectedResourcesStorage, props.votes.voteType]);

  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const resourcesToUse =
    filteredResources.length > 0 ? filteredResources : resources?.records || [];

  useEffect(() => {
    if (filteredResources) {
      const filtered: any = filteredResources || [];
      const totalPagesCalc = Math.ceil(filtered?.length / itemsPerPage);
      if (totalPagesCalc !== totalPages) setTotalPages(totalPagesCalc);
      if (page !== 0) setPage(0);
    }
  }, [filteredResources]);

  useEffect(() => {
    setVisitedTagTabs((prev) =>
      prev.includes(activeTagTab) ? prev : [...prev, activeTagTab]
    );
  }, [activeTagTab]);

  const step1ContainerRef = useRef<HTMLElement | null>(null);
  const scrollToElement = () => {
    if (!step1ContainerRef.current) return;
    const targetPosition =
      step1ContainerRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      100;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    const divElement = document.getElementById(
      'stem-begroot-resource-selections-list'
    );
    if (divElement) {
      divElement.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  };

  const isInSelected = (resource: { id: number }) => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return false;
      return activeTag[activeTagTab].selectedResources.some(
        (res) => res.id === resource.id
      );
    }

    return selectedResources.some((r) => r.id === resource.id);
  };

  const getOriginalResourceUrl = (resource: {
    extraData: { originalId: number | string };
  }) => {
    return props.showOriginalResource &&
      props.originalResourceUrl &&
      resource.extraData?.originalId
      ? props.originalResourceUrl.includes('[id]')
        ? props.originalResourceUrl.replace(
            '[id]',
            `${resource.extraData?.originalId}`
          )
        : `${props.originalResourceUrl}/${resource.extraData?.originalId}`
      : null;
  };

  const resourceSelectable = (resource: {
    id: number;
    budget: number;
    statuses?: Array<{ extraFunctionality?: { canLike?: boolean } }>;
  }) => {
    if (!canLikeResource(resource)) {
      return isInSelected(resource);
    }

    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return false;

      if (
        activeTag[activeTagTab].selectedResources.some(
          (r) => r.id === resource.id
        )
      ) {
        return true;
      }

      if (props.votes.voteType === 'countPerTag') {
        return activeTag[activeTagTab].current < activeTag[activeTagTab].max;
      }

      return (
        activeTag[activeTagTab].current + resource.budget <=
        activeTag[activeTagTab].max
      );
    }

    if (props.votes.voteType === 'budgeting') {
      return (
        isInSelected(resource) ||
        (!isInSelected(resource) &&
          resource.budget <= props.votes.maxBudget - budgetUsed)
      );
    }

    return (
      isInSelected(resource) ||
      (!isInSelected(resource) &&
        (props.votes.maxResources || 0) > selectedResources.length)
    );
  };

  const budgetUsed = (() => {
    if (props.votes.voteType === 'budgetingPerTag') {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      return activeTag ? activeTag[activeTagTab].current : 0;
    }

    return selectedResources.reduce(
      (total, resource) => total + resource.budget,
      0
    );
  })();

  const createItemBtnString = (resource: { id: number; budget: number }) => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return '';

      if (
        activeTag[activeTagTab].selectedResources.some(
          (r) => r.id === resource.id
        )
      ) {
        return step1Delete || 'Verwijder';
      }

      if (props.votes.voteType === 'countPerTag') {
        return !(activeTag[activeTagTab].current < activeTag[activeTagTab].max)
          ? notEnoughBudgetText
          : step1Add || 'Voeg toe';
      }

      return !(
        activeTag[activeTagTab].current + resource.budget <=
        activeTag[activeTagTab].max
      )
        ? notEnoughBudgetText
        : step1Add || 'Voeg toe';
    }

    if (props.votes.voteType === 'budgeting') {
      return !isInSelected(resource) &&
        !(resource.budget <= props.votes.maxBudget - budgetUsed)
        ? notEnoughBudgetText
        : isInSelected(resource)
          ? step1Delete || 'Verwijder'
          : step1Add || 'Voeg toe';
    }

    return !isInSelected(resource) &&
      !((props.votes.maxResources || 0) > selectedResources.length)
      ? notEnoughBudgetText
      : isInSelected(resource)
        ? step1Delete || 'Verwijder'
        : step1Add || 'Voeg toe';
  };

  const onResourcePlainClicked = (resource: any, index: number) => {
    setResourceDetailIndex(index);
    setOpenDetailDialog(true);
  };

  const onResourcePrimaryClicked = (resource: any) => {
    votePendingStorage.clearAllVotePending();
    selectedResourcesStorage.clearSelectedResources();

    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      let newTagCounter = [...tagCounter];

      newTagCounter = newTagCounter.map((tagObj) => {
        if (tagObj[activeTagTab]) {
          if (isInSelected(resource)) {
            tagObj[activeTagTab].current -=
              props.votes.voteType === 'budgetingPerTag' ? resource.budget : 1;
            tagObj[activeTagTab].selectedResources = tagObj[
              activeTagTab
            ].selectedResources.filter(
              (selectedResource: { id: number }) =>
                selectedResource.id !== resource.id
            );
          } else {
            tagObj[activeTagTab].current +=
              props.votes.voteType === 'budgetingPerTag' ? resource.budget : 1;
            tagObj[activeTagTab].selectedResources.push(resource);
          }
        }
        return tagObj;
      });

      setTagCounter(newTagCounter);
      return;
    }

    const resourceIndex = selectedResources.findIndex(
      (r) => r.id === resource.id
    );
    if (resourceIndex === -1) {
      setSelectedResources([...selectedResources, resource]);
    } else {
      const updatedResources = [...selectedResources];
      updatedResources.splice(resourceIndex, 1);
      setSelectedResources(updatedResources);
    }
  };

  const onSelectedResourceRemove = (resource: {
    id: number;
    budget: number;
  }) => {
    votePendingStorage.clearAllVotePending();
    selectedResourcesStorage.clearSelectedResources();

    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      setTagCounter((prev) =>
        prev.map((tagObj) => {
          if (!tagObj[activeTagTab]) return tagObj;
          const block = tagObj[activeTagTab];
          if (
            !block.selectedResources.some(
              (r: { id: number }) => r.id === resource.id
            )
          ) {
            return tagObj;
          }

          return {
            [activeTagTab]: {
              ...block,
              current:
                block.current -
                (props.votes.voteType === 'budgetingPerTag'
                  ? resource.budget
                  : 1),
              selectedResources: block.selectedResources.filter(
                (r: { id: number }) => r.id !== resource.id
              ),
            },
          };
        })
      );
    } else {
      setSelectedResources((prev) => prev.filter((r) => r.id !== resource.id));
    }
  };

  const decideCanAddMore = () => {
    let canAddMore = true;

    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const activeTagData = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTagData) return false;

      const activeTag = activeTagData[activeTagTab];
      const maxLimit = activeTag.max;
      const currentCount = activeTag.current;

      if (props.votes.voteType === 'countPerTag') {
        canAddMore = currentCount < maxLimit;
      } else if (props.votes.voteType === 'budgetingPerTag') {
        const notUsedResources = filteredResources.filter(
          (allR: { id: number }) =>
            !selectedResources.find((selectedR) => allR.id === selectedR.id)
        );
        canAddMore = notUsedResources.some(
          (r: { budget: number }) => r.budget <= maxLimit - currentCount
        );
      }
    } else {
      const notUsedResources = resources?.records.filter(
        (allR: { id: number }) =>
          !selectedResources.find((selectedR) => allR.id === selectedR.id)
      );

      canAddMore =
        props.votes.voteType === 'budgeting'
          ? notUsedResources.some(
              (r: { budget: number }) =>
                r.budget <= props.votes.maxBudget - budgetUsed
            )
          : Math.max(props.votes.maxResources - selectedResources.length, 0) >
            0;
    }

    if (!canAddMore && scrollWhenMaxReached) {
      scrollToElement();
    }

    return canAddMore;
  };

  const selectedBudgets: Array<number> = (() => {
    if (props.votes.voteType === 'budgetingPerTag') {
      const activeTag = tagCounter.find((tagObj) => tagObj[activeTagTab]);
      if (!activeTag) return [];
      return activeTag[activeTagTab].selectedResources.map(
        (r) => r.budget || 0
      );
    }
    return selectedResources.map((r) => r.budget || 0);
  })();

  return {
    // Datastore results (needed by vote flow)
    resources,
    submitVotes,

    // Filtering + paging
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

    // Selection
    openDetailDialog,
    setOpenDetailDialog,
    resourceDetailIndex,
    setResourceDetailIndex,
    selectedResources,
    setSelectedResources,
    tagCounter,
    setTagCounter,
    activeTagTab,
    setActiveTagTab,
    visitedTagTabs,
    setVisitedTagTabs,

    // Grid helpers
    resourceSelectable,
    createItemBtnString,
    getOriginalResourceUrl,
    defineOriginalUrl: getOriginalResourceUrl,
    onResourcePlainClicked,
    onResourcePrimaryClicked,
    onSelectedResourceRemove,
    decideCanAddMore,
    budgetUsed,
    selectedBudgets,
    // Step 1 scroll
    step1ContainerRef,
    scrollToElement,
    scrollToTop,
  };
}
