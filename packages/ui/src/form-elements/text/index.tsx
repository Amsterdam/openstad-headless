import React, { FC, useState, useEffect, useRef } from "react";
import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Textarea,
    Textbox
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';
import './style.css';
import { FormValue } from "@openstad-headless/form/src/form";
import { uniqueId } from 'lodash';
import "trix";
import 'trix/dist/trix.css';
// Temporary TypeScript declaration for 'trix-editor'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'trix-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { input?: string },
        HTMLElement
      >;
    }
  }
}

export type TextInputProps = {
    title: string;
    description?: string;
    minCharacters?: number;
    minCharactersWarning?: string;
    maxCharacters?: number;
    maxCharactersWarning?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'text input' | 'textarea' | 'richtext';
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    rows?: TextInputProps['variant'] extends 'textarea' ? number : undefined | number;
    type?: string;
    onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
    reset?: (resetFn: () => void) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    minCharactersError?: string;
    maxCharactersError?: string;
    nextPageText?: string;
    prevPageText?: string;
    fieldOptions?: { value: string; label: string }[];
}

type TrixEditorProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value: string;
  hideBlockTools?: boolean;
  hideHistoryTools?: boolean;
};

const TrixEditor: React.FC<TrixEditorProps> = ({ 
  onChange, 
  value, 
  hideBlockTools = false,
  hideHistoryTools = false,
}) => {
  const editorRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorIdRef = useRef(`trix-${uniqueId()}`);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const editorElement = editorRef.current;
    const inputElement = inputRef.current;

    if (!editorElement || !inputElement) return;

    const handleTrixChange = (event: Event) => {
      const target = event.target as any;
      const editor = target?.editor;
      
      if (editor) {
        const syntheticEvent = {
          target: { value: inputElement.value },
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        onChange(syntheticEvent);
      }
    };

    const handleTrixInitialize = () => {
      // Find the toolbar specifically for this editor
      const toolbar = (editorElement as any).toolbarElement;
      if (toolbar) {
        // Remove unwanted buttons
        const fileButton = toolbar.querySelector('.trix-button-group--file-tools');
        fileButton?.remove();

        if (hideBlockTools) {
          const blockTools = toolbar.querySelector('.trix-button-group--block-tools');
          const spacer = toolbar.querySelector('.trix-button-group-spacer');
          blockTools?.remove();
          spacer?.remove();
        }

        if (hideHistoryTools) {
          const historyTools = toolbar.querySelector('.trix-button-group--history-tools');
          historyTools?.remove();
        }
      }

      // Set initial value if not already set
      if (!isInitializedRef.current) {
        const editor = (editorElement as any).editor;
        if (editor && value) {
          editor.loadHTML(value);
        }
        isInitializedRef.current = true;
      }
    };

    editorElement.addEventListener('trix-initialize', handleTrixInitialize);
    editorElement.addEventListener('trix-change', handleTrixChange);

    return () => {
      const element = editorRef.current;
      if (element) {
        element.removeEventListener('trix-initialize', handleTrixInitialize);
        element.removeEventListener('trix-change', handleTrixChange);
      }
    };
  }, [onChange, hideBlockTools]);

  // Update editor value when prop changes (but not on every render)
  useEffect(() => {
    const editorElement = editorRef.current;
    if (editorElement && isInitializedRef.current) {
      const editor = (editorElement as any).editor;
      if (editor) {
        const currentHTML = editor.getDocument().toString().trim();
        const newValue = (value || '').trim();
        // Only update if values are actually different
        if (currentHTML !== newValue) {
          editor.loadHTML(value || '');
        }
      }
    }
  }, [value]);

  return (
    <div>
      <input 
        ref={inputRef}
        id={editorIdRef.current} 
        type="hidden" 
        defaultValue={value}
      />
      <trix-editor ref={editorRef} input={editorIdRef.current}></trix-editor>
    </div>
  );
};

const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant = 'textarea',
    fieldKey,
    fieldRequired = false,
    placeholder,
    defaultValue = '',
    onChange,
    disabled = false,
    minCharacters = 0,
    minCharactersWarning = 'Nog minimaal {minCharacters} tekens',
    maxCharacters = 0,
    maxCharactersWarning = 'Je hebt nog {maxCharacters} tekens over',
    rows,
    reset,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
    infoImage = '',
    randomId = '',
    fieldInvalid = false,
}) => {
    const variantMap = {
        'text input': Textbox,
        'textarea': Textarea,
        'richtext': TrixEditor
    }
    const InputComponent = variantMap[variant];

    

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    const [isFocused, setIsFocused] = useState(false);
    const [helpText, setHelpText] = useState('');
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (reset) {
            reset(() => setValue(defaultValue));
        }
    }, [reset, defaultValue]);

    const characterHelpText = (count: number) => {
        let helpText = '';

        if (!!minCharacters && count < minCharacters) {
            helpText = minCharactersWarning?.replace('{minCharacters}', (minCharacters - count).toString());
        } else if (!!maxCharacters && count < maxCharacters) {
            helpText = maxCharactersWarning?.replace('{maxCharacters}', (maxCharacters - count).toString());
        }

        setHelpText(helpText);
    }

    const getType = (fieldKey: string) => {
        switch (fieldKey) {
            case 'email':
                return 'email';
            case 'tel':
                return 'tel';
            case 'password':
                return 'password';
            default:
                return 'text';
        }
    }

    const getAutocomplete = (fieldKey: string) => {
        switch (fieldKey?.toLocaleLowerCase()) {
            case 'mail':
                return 'email';
            case 'tel':
                return 'tel';
            case 'password':
                return 'current-password';
            case 'voornaam':
                return 'given-name';
            case 'achternaam':
                return 'family-name';
            case 'straatnaam':
                return 'street-address';
            case 'postcode':
                return 'postal-code';
            case 'woonplaats':
                return 'address-level2';
            case 'land':
                return 'country';
            default:
                return 'on';
        }
    }

    const fieldHasMaxOrMinCharacterRules = !!minCharacters || !!maxCharacters;
    return (
        <FormField type="text">
            {title && (
                <Paragraph className="utrecht-form-field__label">
                    <FormLabel htmlFor={randomId}>{title}</FormLabel>
                </Paragraph>
            )}
            {description &&
                <>
                    <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
                    <Spacer size={.5} />
                </>
            }

            {showMoreInfo && (
                <>
                    <AccordionProvider
                        sections={[
                            {
                                headingLevel: 3,
                                body: <HtmlContent html={moreInfoContent} />,
                                expanded: undefined,
                                label: moreInfoButton,
                            }
                        ]}
                    />
                    <Spacer size={1.5} />
                </>
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

            <div className={`utrecht-form-field__input ${fieldHasMaxOrMinCharacterRules ? 'help-text-active' : ''}`}>
                <InputComponent
                    id={randomId}
                    name={fieldKey}
                    required={fieldRequired}
                    type={getType(fieldKey)}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        setValue(e.target.value);
                        if (onChange) {
                            onChange({
                                name: fieldKey,
                                value: e.target.value,
                            });
                        }
                        characterHelpText(e.target.value.length);
                    }}
                    disabled={disabled}
                    rows={rows}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={getAutocomplete(fieldKey)}
                    aria-invalid={fieldInvalid}
                    aria-describedby={`${randomId}_error`}
                />
                {isFocused && helpText &&
                  <FormFieldDescription className="help-text">{helpText}</FormFieldDescription>
                }
            </div>
        </FormField>
    );
};

export { TrixEditor };
export default TextInput;
