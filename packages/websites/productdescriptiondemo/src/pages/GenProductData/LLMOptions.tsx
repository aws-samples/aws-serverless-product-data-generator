/**
 * Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  Input,
  Select,
  SelectProps,
  Slider,
  SpaceBetween,
} from "@cloudscape-design/components";
import FormField from "@cloudscape-design/components/form-field";
import { GenProductRequestContentDescriptionLengthEnum } from "descriptiongenerator-typescript-react-query-hooks";
import { useState } from "react";
import "./llmoptions.css";
import DescriptionLengthSelector from "../../components/DescriptionLengthSelector";

export const BedrockModels: SelectProps.Option[] = [
  {
    label: "Anthropic Claude 3 Haiku",
    value: "anthropic.claude-3-haiku-20240307-v1:0",
  },
  {
    label: "Anthropic Claude 3 Sonnet",
    value: "anthropic.claude-3-sonnet-20240229-v1:0",
  },
  // {
  //   label: "Anthropic Claude 3 Opus",
  //   value: "anthropic.claude-3-opus-20240229-v1:0",
  // },
];

export interface LLMOptions {
  temperature?: number;
  model?: SelectProps.Option;
  language?: string;
  descriptionLength?: GenProductRequestContentDescriptionLengthEnum;
}

export interface LLMOptionsFormProps {
  options: LLMOptions;
  setOptions: React.Dispatch<React.SetStateAction<LLMOptions>>;
}

const defaultTemperature = 0.1;
const LLMOptionsForm: React.FC<LLMOptionsFormProps> = (
  props: LLMOptionsFormProps,
) => {
  const { options, setOptions } = props;
  const [languageError, setLanguageError] = useState<string | undefined>();
  const [temperatureError, setTemperatureError] = useState<
    string | undefined
  >();

  return (
    <SpaceBetween direction="vertical" size="l">
      <FormField
        label="Language"
        description="Describe the language to use"
        errorText={languageError}
      >
        <Input
          value={options.language || ""}
          onChange={({ detail }) => {
            if (detail.value.length > 200) {
              setLanguageError("Language must be less than 200 characters");
            } else {
              setLanguageError(undefined);
            }
            setOptions((prev) => {
              return { ...prev, language: detail.value };
            });
          }}
          placeholder="English"
        ></Input>
      </FormField>
      <DescriptionLengthSelector
        value={options.descriptionLength}
        onChange={(value) => {
          setOptions((prev) => {
            return { ...prev, descriptionLength: value };
          });
        }}
      />
      <FormField label="Model" description="Choose a model">
        <Select
          selectedOption={options.model || null}
          placeholder={BedrockModels[0].label}
          options={BedrockModels}
          onChange={({ detail }) => {
            setOptions((prev) => {
              return { ...prev, model: detail.selectedOption };
            });
          }}
        ></Select>
      </FormField>
      <FormField
        label="Temperature"
        description="Adjust the likelihood of randomness"
        errorText={temperatureError}
      >
        <div className="llmoptions-flex-wrapper">
          <div className="llmoptions-slider-wrapper">
            <Slider
              onChange={({ detail }) => {
                setTemperatureError(undefined);
                setOptions((prev) => {
                  return { ...prev, temperature: detail.value };
                });
              }}
              value={
                options.temperature !== undefined
                  ? options.temperature
                  : defaultTemperature
              }
              valueFormatter={(value) => value.toFixed(1)}
              step={0.1}
              max={1}
              min={0}
            />
          </div>
          <SpaceBetween size="m" alignItems="center" direction="horizontal">
            <div className="llmoptions-input-wrapper">
              <Input
                value={
                  options.temperature !== undefined
                    ? options.temperature.toFixed(1)
                    : defaultTemperature.toFixed(1)
                }
                step={0.1}
                onChange={({ detail }) => {
                  let value = Number(detail.value);
                  if (isNaN(value)) {
                    // if (detail.value.startsWith(".")) {
                    //   value = Number(`0${detail.value}`);
                    // } else if (detail.value.endsWith(".")) {
                    //   value = Number(`${detail.value}0`);
                    // } else {
                    //   setTemperatureError("Temperature must be a number");
                    // }
                    setTemperatureError("Temperature must be a number");
                  } else if (value < 0 || value > 1) {
                    setTemperatureError("Temperature must be between 0 and 1");
                  } else {
                    setTemperatureError(undefined);
                  }
                  setOptions((prev) => {
                    return { ...prev, temperature: value };
                  });
                }}
                placeholder={defaultTemperature.toFixed(1)}
                type="number"
                inputMode="numeric"
                controlId="validation-input"
              />
            </div>
          </SpaceBetween>
        </div>
      </FormField>
    </SpaceBetween>
  );
};

export default LLMOptionsForm;
