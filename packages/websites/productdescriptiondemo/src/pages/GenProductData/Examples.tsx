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
  Button,
  Container,
  Header,
  SpaceBetween,
  Textarea,
  FormField,
  Input,
} from "@cloudscape-design/components";
import { ProductData } from "descriptiongenerator-typescript-react-query-hooks";

export interface ExamplesProps {
  value: ProductData[];
  setValue: (
    value: ((prevState: ProductData[]) => ProductData[]) | ProductData[],
  ) => void;
}

const Examples: React.FC<ExamplesProps> = (props: ExamplesProps) => {
  const { value, setValue } = props;

  return (
    <Container
      header={
        <Header
          variant="h3"
          description="Optional examples of product titles and descriptions to set the language, style, and tone."
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setValue([]);
                }}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  setValue((prevState) => [
                    ...prevState,
                    { title: "", description: "" },
                  ]);
                }}
              >
                Add
              </Button>
            </SpaceBetween>
          }
        >
          Example Products
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="xs">
        {value.map((example, index) => (
          <Container
            header={
              <Header
                variant="h3"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setValue((prevState) => [
                          ...prevState.slice(0, index),
                          ...prevState.slice(index + 1),
                        ]);
                      }}
                      variant="icon"
                      iconName="remove"
                    />
                  </SpaceBetween>
                }
              >
                Example {index + 1}
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="xs">
              <FormField label="Title">
                <Input
                  value={example.title}
                  onChange={(e) => {
                    setValue((prevState) => {
                      const newState = [...prevState];
                      newState[index].title = e.detail.value;
                      return newState;
                    });
                  }}
                />
              </FormField>
              <FormField label="Description">
                <Textarea
                  value={example.description}
                  onChange={(e) => {
                    setValue((prevState) => {
                      const newState = [...prevState];
                      newState[index].description = e.detail.value;
                      return newState;
                    });
                  }}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        ))}
      </SpaceBetween>
    </Container>
  );
};

export default Examples;
