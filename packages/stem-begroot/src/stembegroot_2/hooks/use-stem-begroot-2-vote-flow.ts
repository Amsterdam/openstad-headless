import { hasRole } from '@openstad-headless/lib';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import NotificationService from '../../../../lib/NotificationProvider/notification-service';
import type { StemBegroot2WidgetProps } from '../types';

type VoteFlowPropsSlice = Pick<
  StemBegroot2WidgetProps,
  'votes' | 'api' | 'projectId'
>;

type VoteFlowArgs = {
  props: VoteFlowPropsSlice;
  currentUser: any;

  // Step navigation
  currentStep: number;
  setCurrentStep: (next: number) => void;

  // Selection state
  selectedResources: any[];
  setSelectedResources: React.Dispatch<React.SetStateAction<any[]>>;
  tagCounter: Array<any>;
  setTagCounter: React.Dispatch<React.SetStateAction<Array<any>>>;
  activeTagTab: string;
  setActiveTagTab: (tag: string) => void;
  visitedTagTabs: Array<string>;

  // Storages + backend
  votePendingStorage: any;
  selectedResourcesStorage: any;
  resources: any;
  submitVotes: (recordsToLike: Array<any>) => Promise<any>;

  voteAfterLoggingIn: boolean;
};

export function useStemBegroot2VoteFlow(args: VoteFlowArgs) {
  const {
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
  } = args;

  const [pendingVoteFetched, setPendingVoteFetched] = useState(false);
  const submitInProgressRef = useRef(false);

  const isAllowedToVote = useMemo(() => {
    return (
      props.votes.requiredUserRole &&
      hasRole(currentUser, props.votes.requiredUserRole)
    );
  }, [currentUser, props.votes.requiredUserRole]);

  const notifyVoteMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      NotificationService.addNotification(message, 'error');
    }
  };

  // Restore pending-budget-vote from server if UUID is in URL
  useEffect(() => {
    if (pendingVoteFetched) return;

    const url = new URL(window.location.href);
    const pendingUuidFromUrl = url.searchParams.get('pendingBudgetVote');

    async function restoreFromServer(uuid: string) {
      try {
        if (!uuid) return;

        setPendingVoteFetched(true);

        if (!props.api || !props.api.url) return;

        const apiUrl = `${props.api.url}/api/pending-budget-vote/${uuid}`;

        const pendingBudgetVote = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Remove pendingBudgetVote from URL
        url.searchParams.delete('pendingBudgetVote');
        window.history.replaceState({}, document.title, url.toString());

        if (!pendingBudgetVote.ok || !pendingBudgetVote) {
          // Keep old behaviour: log + exit silently
          // eslint-disable-next-line no-console
          console.error(
            'Failed to fetch pending budget vote from server',
            pendingBudgetVote.statusText
          );
          return;
        }

        const pendingBudgetVoteData = await pendingBudgetVote.json();

        if (
          !pendingBudgetVoteData ||
          !pendingBudgetVoteData.data ||
          !pendingBudgetVoteData.data
        ) {
          // eslint-disable-next-line no-console
          console.error('No pending budget vote data found on server');
          return;
        }

        const { data } = pendingBudgetVoteData;

        if (
          props.votes.voteType === 'countPerTag' ||
          props.votes.voteType === 'budgetingPerTag'
        ) {
          votePendingStorage.setVotePendingPerTag(data as any);
        } else {
          votePendingStorage.setVotePending(data as any);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore pending budget vote from server', e);
      }
    }

    if (pendingUuidFromUrl) {
      void restoreFromServer(pendingUuidFromUrl);
      return;
    }

    const localPending =
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
        ? votePendingStorage.getVotePendingPerTag()
        : votePendingStorage.getVotePending();

    if (localPending) {
      setPendingVoteFetched(true);
    }
  }, [
    pendingVoteFetched,
    props.api?.url,
    props.projectId,
    props.votes.voteType,
    votePendingStorage,
  ]);

  // Persist selection to UI hint when pending exists
  useEffect(() => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const pendingPerTag = votePendingStorage.getVotePendingPerTag();

      if (pendingPerTag) {
        setTagCounter((prevTagCounter) =>
          prevTagCounter.map((tagObj) => {
            const tagName = Object.keys(tagObj)[0];

            if (pendingPerTag[tagName]) {
              const selectedResourceIds = Object.keys(
                pendingPerTag[tagName]
              ).map(Number);

              const resourcesThatArePending: Array<any> =
                resources?.records?.filter((r: any) => {
                  return (
                    selectedResourceIds && selectedResourceIds.includes(r.id)
                  );
                }) || [];

              const currentCount =
                props.votes.voteType === 'budgetingPerTag'
                  ? resourcesThatArePending.reduce(
                      (total, r) => total + r.budget,
                      0
                    )
                  : resourcesThatArePending.length;

              return {
                [tagName]: {
                  ...tagObj[tagName],
                  selectedResources: resourcesThatArePending,
                  current: currentCount,
                },
              };
            }

            return tagObj;
          })
        );
      }
    } else {
      const pending = votePendingStorage.getVotePending();
      if (
        pending &&
        resources?.records?.length > 0 &&
        selectedResources.length === 0
      ) {
        setSelectedResources(
          resources?.records?.filter((r: any) => pending[r.id])
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources?.records, votePendingStorage]);

  // Force logged-in user to skip step 2: first time entering stemcode
  useEffect(() => {
    const pending =
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
        ? votePendingStorage.getVotePendingPerTag()
        : votePendingStorage.getVotePending();

    if (!pending || !isAllowedToVote) return;

    const hasPendingSelection =
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
        ? tagCounter.some((tagObj) => {
            const tagName = Object.keys(tagObj)[0];
            const selectedForTag = tagObj[tagName]?.selectedResources || [];
            return selectedForTag.length > 0;
          })
        : selectedResources.length > 0;

    if (!voteAfterLoggingIn) {
      if (currentStep < 3) {
        setCurrentStep(3);
      }
      return;
    }

    if (hasPendingSelection && currentStep < 4) {
      if (currentStep < 3) {
        setCurrentStep(3);
      }

      void (async () => {
        const submitted = await submitVoteAndCleanup();
        if (submitted) {
          setCurrentStep(4);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUser,
    currentStep,
    selectedResources,
    tagCounter,
    isAllowedToVote,
    voteAfterLoggingIn,
    props.votes.voteType,
    votePendingStorage,
  ]);

  const doVote = async (resourcesToVote: Array<any>) => {
    if (!props.votes.isActive) {
      throw new Error('Stemmen is niet actief!');
    }

    if (resourcesToVote.length > 0) {
      const recordsToLike = resourcesToVote.map((r: any) => ({
        resourceId: r.id,
        opinion: 'yes',
      }));
      return await submitVotes(recordsToLike);
    }
  };

  const prepareForVote = (
    e: React.MouseEvent<HTMLElement, MouseEvent> | null
  ) => {
    if (e) e.stopPropagation();

    if (
      props.votes.voteType !== 'countPerTag' &&
      props.votes.voteType !== 'budgetingPerTag'
    ) {
      const resourcesToVoteFor: { [key: string]: any } = {};

      (selectedResources.length ? selectedResources : []).forEach(
        (resource: any) => {
          resourcesToVoteFor[resource.id] = 'yes';
        }
      );

      votePendingStorage.setVotePending(resourcesToVoteFor);
    } else {
      const resourcesToVoteForPerTag: {
        [tag: string]: { [key: string]: any };
      } = {};

      tagCounter.forEach((tagObj) => {
        const tagName = Object.keys(tagObj)[0];
        const selectedResourcesForTag = tagObj[tagName].selectedResources;

        resourcesToVoteForPerTag[tagName] = {};
        selectedResourcesForTag.forEach((resource: any) => {
          resourcesToVoteForPerTag[tagName][resource.id] = 'yes';
        });
      });

      votePendingStorage.setVotePendingPerTag(resourcesToVoteForPerTag);
    }
  };

  const submitVoteAndCleanup = async () => {
    let submitted = false;

    try {
      if (submitInProgressRef.current) {
        return false;
      }
      submitInProgressRef.current = true;

      if (
        props.votes.voteType === 'countPerTag' ||
        props.votes.voteType === 'budgetingPerTag'
      ) {
        let allResourcesToVote: any[] = [];

        for (const tagObj of tagCounter) {
          const tagName = Object.keys(tagObj)[0];

          const resourcesToVote = tagObj[tagName].selectedResources
            .map((resourceSelected: { id: number }) => {
              return resources?.records?.find(
                (resource: { id: number }) =>
                  resource.id === resourceSelected.id
              );
            })
            .filter(Boolean);

          allResourcesToVote = allResourcesToVote.concat(resourcesToVote);
        }

        const uniqueResourcesToVote = Array.from(
          new Set(allResourcesToVote.map((r) => r.id))
        ).map((id) => allResourcesToVote.find((r) => r.id === id));

        if (uniqueResourcesToVote.length > 0) {
          await doVote(uniqueResourcesToVote);
          submitted = true;

          votePendingStorage.clearVotePendingPerTag();
          selectedResourcesStorage.clearSelectedResources();
        }
      } else {
        if (selectedResources.length > 0) {
          await doVote(selectedResources);
          submitted = true;

          votePendingStorage.clearVotePending();
          selectedResourcesStorage.clearSelectedResources();
        }
      }
    } catch (err: any) {
      notifyVoteMessage(err.message, true);
    } finally {
      submitInProgressRef.current = false;
    }

    return submitted;
  };

  const handleNextClick = async () => {
    if (currentStep === 0) {
      if (
        props.votes.voteType === 'countPerTag' ||
        props.votes.voteType === 'budgetingPerTag'
      ) {
        const unmetTags = tagCounter.filter((tagObj: any) => {
          const key = Object.keys(tagObj)[0];

          if (
            tagObj[key].min === 0 &&
            tagObj[key].current === 0 &&
            key !== activeTagTab &&
            !visitedTagTabs.includes(key)
          ) {
            return true;
          }

          return tagObj[key].current < tagObj[key].min;
        });

        const nextUnmetTag = unmetTags.find((tagObj: any) => {
          const key = Object.keys(tagObj)[0];
          return key !== activeTagTab;
        });

        if (nextUnmetTag) {
          const tagName = Object.keys(nextUnmetTag)[0];
          setActiveTagTab(tagName);
          return;
        }

        const notOneTagSelected = tagCounter.every((tagObj: any) => {
          const key = Object.keys(tagObj)[0];
          return tagObj[key].current === 0;
        });

        if (notOneTagSelected) {
          notifyVoteMessage('Maak een keuze om verder te kunnen gaan.', true);
          return;
        }
      }

      prepareForVote(null);
    }

    if (currentStep === 3) {
      const submitted = await submitVoteAndCleanup();
      if (submitted) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      currentUser.logout({ url: location.href });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const nextButtonDisabled = (() => {
    if (
      props.votes.voteType === 'countPerTag' ||
      props.votes.voteType === 'budgetingPerTag'
    ) {
      const unmetTags = tagCounter.filter((tagObj: any) => {
        const key = Object.keys(tagObj)[0];
        return tagObj[key].current < tagObj[key].min;
      });

      if (unmetTags.length === 0) {
        return false;
      }

      if (
        unmetTags.length === 1 &&
        Object.keys(unmetTags[0])[0] === activeTagTab
      ) {
        return true;
      }
    }

    return (
      (props?.votes?.voteType === 'likes' ||
        props?.votes?.voteType === 'budgeting') &&
      selectedResources.length === 0
    );
  })();

  const nextButtonLabel = (() => {
    if (currentStep < 3) {
      if (
        props.votes.voteType === 'countPerTag' ||
        props.votes.voteType === 'budgetingPerTag'
      ) {
        const unmetTags = tagCounter.filter((tagObj: any) => {
          const key = Object.keys(tagObj)[0];

          if (
            tagObj[key].min === 0 &&
            tagObj[key].current === 0 &&
            key !== activeTagTab &&
            !visitedTagTabs.includes(key)
          ) {
            return true;
          }

          return tagObj[key].current < tagObj[key].min;
        });

        const nextUnmetTag = unmetTags.find((tagObj: any) => {
          const key = Object.keys(tagObj)[0];
          return key !== activeTagTab;
        });

        if (nextUnmetTag) {
          const tagName = Object.keys(nextUnmetTag)[0];
          return `Kies voor ${tagName.charAt(0).toUpperCase() + tagName.slice(1)}`;
        }
      }
      return 'Volgende';
    }

    if (currentStep === 3) return 'Stem indienen';
    if (currentStep === 4) return 'Klaar';
    return 'Volgende';
  })();

  return {
    handleNextClick,
    nextButtonDisabled,
    nextButtonLabel,
    prepareForVote,
    submitVoteAndCleanup,
    isAllowedToVote,
    pendingVoteFetched,
  };
}
