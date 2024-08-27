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

import { GenProductRequestContentDescriptionLengthEnum } from "@amzn/descriptiongenerator-typescript-react-query-hooks";
import { Select, SpaceBetween } from "@cloudscape-design/components";
import FormField from "@cloudscape-design/components/form-field";
import React from "react";

interface DescriptionLengthSelectorProps {
  value?: GenProductRequestContentDescriptionLengthEnum;
  onChange: (value: GenProductRequestContentDescriptionLengthEnum) => void;
}

const DescriptionLengthSelector: React.FC<DescriptionLengthSelectorProps> = ({
  value,
  onChange,
}) => {
  const options = [
    { value: undefined },
    { label: "Short", value: "short" },
    { label: "Medium", value: "medium" },
    { label: "Long", value: "long" },
  ];

  return (
    <FormField label="Description Length" description="Select desired length">
      <SpaceBetween direction="horizontal" size="xs">
        <Select
          placeholder="Desired length"
          selectedOption={
            value
              ? {
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                  value,
                }
              : null
          }
          onChange={({ detail }) =>
            onChange(
              detail.selectedOption
                .value as GenProductRequestContentDescriptionLengthEnum,
            )
          }
          options={options}
        />
      </SpaceBetween>
    </FormField>
  );
};

export default DescriptionLengthSelector;
