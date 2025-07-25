import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Select,
    SelectOption
} from "@utrecht/component-library-react";
import React, { useState } from "react";
import {FC} from "react";
import {MultiSelect, Spacer} from '@openstad-headless/ui/src';

export type SelectFieldProps = {
    title?: string;
    description?: string;
    choices?: string[] | [{value: string, label: string}];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    defaultOption?: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
    type?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    multiple?: boolean;
    defaultValue?: string | string[];
}

const SelectField: FC<SelectFieldProps> = ({
      title,
      description,
      choices = [],
      fieldKey,
      defaultOption = 'Selecteer een optie',
      fieldRequired= false,
      onChange,
      disabled = false,
      showMoreInfo = false,
      moreInfoButton = 'Meer informatie',
      moreInfoContent = '',
      infoImage = '',
      randomId = '',
      fieldInvalid = false,
      multiple = false,
      defaultValue = [],
}) => {
    choices = choices.map((choice) => {
      if (typeof choice === 'string') {
        return { value: choice, label: choice }
      } else {
        return choice;
      }
    }) as [{value: string, label: string}];

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    const initialSelected = multiple
      ? defaultValue
      : (Array.isArray(defaultValue) && defaultValue.length > 0 ? defaultValue[0] : '');

    const [selected, setSelected] = useState<string | string[]>(initialSelected);

    return (
        <FormField type="select">
            <FormLabel htmlFor={fieldKey}>{title}</FormLabel>
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

            <Paragraph className="utrecht-form-field__input">
              { multiple ? (
                  <MultiSelect
                    label={defaultOption}
                    id={fieldKey}
                    options={choices.map(choice => ({
                      value: choice.value,
                      label: choice.label,
                      checked: Array.isArray(selected) ? selected.includes(choice.value) : false,
                    }))}
                    onItemSelected={(optionValue: string) => {
                      let newSelected = Array.isArray(selected) ? [...selected] : [];
                      if (newSelected.includes(optionValue)) {
                        newSelected = newSelected.filter(v => v !== optionValue);
                      } else {
                        newSelected.push(optionValue);
                      }
                      setSelected(newSelected);
                      if (onChange) {
                        onChange({
                          name: fieldKey,
                          value: newSelected?.join(","),
                        });
                      }
                    }}
                  />
              ) : (
                <Select
                  className="form-item"
                  name={fieldKey}
                  id={fieldKey}
                  required={fieldRequired}
                  onChange={(e) => {
                    setSelected(e.target.value);
                    if (onChange) {
                      onChange({
                        name: fieldKey,
                        value: e.target.value
                      })
                    }
                  }}
                  disabled={disabled}
                  aria-invalid={fieldInvalid}
                  aria-describedby={`${randomId}_error`}
                  value={ selected }
                >
                  <SelectOption value="">
                    {defaultOption}
                  </SelectOption>
                  {choices?.map((value, index) => (
                    <SelectOption
                      key={index}
                      value={value && value.value}
                    >
                      {value && value.label}
                    </SelectOption>
                  ))}
                </Select>
              ) }
            </Paragraph>
        </FormField>
    );
};

export default SelectField;
