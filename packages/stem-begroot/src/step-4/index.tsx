import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import { Heading5, Paragraph, Button } from "@utrecht/component-library-react";

type Props = {
  loginUrl: string;
  voteMessage: string;
  thankMessage: string;
  showNewsletterButton: boolean;
  newsLetterTitle: string;
};
export const Step4 = ({
  showNewsletterButton,
  thankMessage,
  voteMessage,
  newsLetterTitle
}: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading5>{voteMessage}</Heading5>
      <Paragraph>{thankMessage}</Paragraph>

      {/*{showNewsletterButton ? (*/}
      {/*  <>*/}
      {/*    <Spacer size={2} />*/}
      {/*    <Button*/}
      {/*      appearance='primary-action-button'*/}
      {/*      onClick={() => {*/}
      {/*        // What should happen here?*/}
      {/*      }}>*/}
      {/*      {newsLetterTitle}*/}
      {/*    </Button>*/}
      {/*  </>*/}
      {/*) : null}*/}
    </>
  );
};
