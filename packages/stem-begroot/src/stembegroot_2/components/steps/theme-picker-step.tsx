import '@utrecht/component-library-css';
import { Button } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

type Props = {
  step0Html: string;
  tagsToDisplay: string[];
  onPickTheme: (tag: string) => void;
};

export function ThemePickerStep({
  step0Html,
  tagsToDisplay,
  onPickTheme,
}: Props) {
  return (
    <div className="vote-per-theme-container">
      <div
        className="vote-per-theme-intro"
        dangerouslySetInnerHTML={{ __html: step0Html }}
      />
      <div className="themes-container">
        {tagsToDisplay.map((tag: string) => (
          <div className="theme" key={tag}>
            <Button
              appearance="primary-action-button"
              onClick={() => onPickTheme(tag)}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
