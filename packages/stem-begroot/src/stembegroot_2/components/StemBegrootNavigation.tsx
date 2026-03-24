import '@utrecht/component-library-css';
import { Button, ButtonLink } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

type Props = {
  currentStep: number;

  stemCodeTitleSuccess: string;
  loginUrlForStemCodeSuccess: string;

  showNewsletterButton: boolean;
  newsLetterTitle: string;
  newsLetterLink: string;

  onPrev: () => void;
  onNext: () => Promise<void>;

  nextDisabled: boolean;
  nextLabel: string;
};

export function StemBegrootNavigation({
  currentStep,
  stemCodeTitleSuccess,
  loginUrlForStemCodeSuccess,
  showNewsletterButton,
  newsLetterTitle,
  newsLetterLink,
  onPrev,
  onNext,
  nextDisabled,
  nextLabel,
}: Props) {
  return (
    <div className="begroot-step-panel-navigation-section">
      {currentStep > 0 && currentStep < 3 ? (
        <Button appearance="secondary-action-button" onClick={onPrev}>
          Vorige
        </Button>
      ) : null}

      {currentStep === 3 ? (
        <Button
          appearance="secondary-action-button"
          onClick={() => {
            const loginUrl = new URL(loginUrlForStemCodeSuccess);
            document.location.href = loginUrl.toString();
          }}>
          {stemCodeTitleSuccess}
        </Button>
      ) : null}

      {/* Dont show on voting step if you are on step 2 your not logged in*/}
      {currentStep !== 2 && currentStep !== -1 ? (
        <>
          {currentStep === 4 && showNewsletterButton && (
            <ButtonLink
              href={newsLetterLink}
              appearance="secondary-action-button"
              rel="noopener noreferrer">
              {newsLetterTitle}
            </ButtonLink>
          )}

          <Button
            appearance="primary-action-button"
            onClick={async () => {
              await onNext();
            }}
            disabled={nextDisabled}>
            {nextLabel}
          </Button>
        </>
      ) : null}
    </div>
  );
}
