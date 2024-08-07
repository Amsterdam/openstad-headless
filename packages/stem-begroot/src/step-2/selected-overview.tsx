import React, { Fragment } from 'react';
import { Image, Spacer } from '@openstad-headless/ui/src';
import { BudgetStatusPanel } from '../reuseables/budget-status-panel';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Heading5, Paragraph, Strong } from '@utrecht/component-library-react';

type Props = {
  selectedResources: Array<any>;
  budgetUsed: number;
  maxBudget: number;
  maxNrOfResources: number;
  introText?: string;
  typeIsBudgeting: boolean;
  showInfoMenu?: boolean;
  step2Title: string;
  panelTitle?: string;
  panelItem1?: string;
  panelItem2?: string;
};

export const BegrotenSelectedOverview = ({
  budgetUsed,
  maxBudget,
  maxNrOfResources,
  selectedResources,
  introText = '',
  typeIsBudgeting,
  showInfoMenu,
  step2Title,
  panelTitle,
  panelItem1,
  panelItem2,
}: Props) => {
  return (
    <>
      <div className="begroot-step-2-instruction-budget-status-panel">
        <Paragraph>{introText}</Paragraph>
        {showInfoMenu && (
          <BudgetStatusPanel
            typeIsBudgeting={typeIsBudgeting}
            maxNrOfResources={maxNrOfResources}
            nrOfResourcesSelected={selectedResources.length}
            maxBudget={maxBudget}
            budgetUsed={budgetUsed}
            showInfoMenu={showInfoMenu}
            title={panelTitle}
            item1={panelItem1}
            item2={panelItem2}
          />
        )}
      </div>

      <Spacer size={1.5} />
      <div className="budget-overview-panel">
        <Heading5>{step2Title}</Heading5>
        <Spacer size={1} />

        {selectedResources.map((resource) => {
          let defaultImage = '';

          interface Tag {
            name: string;
            defaultResourceImage?: string;
          }

          if (Array.isArray(resource?.tags)) {
            const sortedTags = resource.tags.sort((a: Tag, b: Tag) => a.name.localeCompare(b.name));
            const tagWithImage = sortedTags.find((tag: Tag) => tag.defaultResourceImage);
            defaultImage = tagWithImage?.defaultResourceImage || '';
          }

          return (
            <div key={`budget-overview-row-${resource.id}`} className="budget-two-text-row-spaced">
              <section className='budget-overview-row'>
                <Image
                  height={'4rem'}
                  width={'4rem'}
                  src={resource.images?.at(0)?.url || defaultImage}
                />
                <div className="budget-resource-container">
                  <Paragraph>{resource.title}</Paragraph>
                  {typeIsBudgeting ? (
                    <Paragraph>
                      <Strong>&euro;{resource.budget?.toLocaleString('nl-NL') || 0}</Strong>
                    </Paragraph>
                  ) : null}
                </div>
              </section>

            </div>
          )
        })}
      </div>
    </>
  );
};
