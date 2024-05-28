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
  Container,
  ExpandableSection,
  SpaceBetween,
} from "@cloudscape-design/components";
import { ProductData } from "descriptiongenerator-typescript-react-query-hooks";
import { useState } from "react";
import Examples from "./Examples";
import LLMOptionsForm, { LLMOptions } from "./LLMOptions";
import ProductMetadata from "./ProductMetadata";

const RefineProductForm = (props: {
  productMetadata: string;
  setProductMetadata: (value: ((prevState: string) => string) | string) => void;
  examples: ProductData[];
  setExamples: (
    value: ((prevState: ProductData[]) => ProductData[]) | ProductData[],
  ) => void;
  llmOptions: LLMOptions;
  setLLMOptions: (
    value: ((prevState: LLMOptions) => LLMOptions) | LLMOptions,
  ) => void;
  expanded: boolean;
}) => {
  const [expanded, setExpanded] = useState(props.expanded);
  return (
    <SpaceBetween size="l">
      <Container>
        <ExpandableSection
          expanded={expanded}
          onChange={() => setExpanded((prev) => !prev)}
          headerText="Options"
        >
          <SpaceBetween direction="vertical" size="l">
            <ProductMetadata
              value={props.productMetadata}
              setValue={props.setProductMetadata}
            />
            <Examples value={props.examples} setValue={props.setExamples} />
            <LLMOptionsForm
              options={props.llmOptions}
              setOptions={props.setLLMOptions}
            />
          </SpaceBetween>
        </ExpandableSection>
      </Container>
    </SpaceBetween>
  );
};

export default RefineProductForm;
