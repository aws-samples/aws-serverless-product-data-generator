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
import Examples from "./Examples";
import ImageUploader from "./ImageUploader";
import LLMOptionsForm, { LLMOptions } from "./LLMOptions";
import ProductMetadata from "./ProductMetadata";

const NewProductForm = (props: {
  imageFiles: File[];
  setImageFiles: (value: ((prevState: File[]) => File[]) | File[]) => void;
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
}) => {
  return (
    <SpaceBetween size="l">
      <Container>
        <SpaceBetween direction="vertical" size="l">
          <ImageUploader
            value={props.imageFiles}
            setValue={props.setImageFiles}
          />
          <ProductMetadata
            value={props.productMetadata}
            setValue={props.setProductMetadata}
          />
          <Examples value={props.examples} setValue={props.setExamples} />
          <ExpandableSection headerText="Options">
            <LLMOptionsForm
              options={props.llmOptions}
              setOptions={props.setLLMOptions}
            />
          </ExpandableSection>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default NewProductForm;
