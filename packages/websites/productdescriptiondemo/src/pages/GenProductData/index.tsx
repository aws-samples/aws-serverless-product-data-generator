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
  GenProductRequestContentModelEnum,
  ProductData,
  useGenerateProduct,
} from "@amzn/descriptiongenerator-typescript-react-query-hooks";
import { useCognitoAuthContext } from "@aws-northstar/ui";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  Button,
  Container,
  ContentLayout,
  ExpandableSection,
  Flashbar,
  FlashbarProps,
  Header,
  SpaceBetween,
  Spinner,
  TextContent,
} from "@cloudscape-design/components";
import { useContext, useState } from "react";
import { LLMOptions } from "./LLMOptions";
import NewProductForm from "./NewProductForm";
import RefineProductForm from "./RefineProductForm";
import { prepareImages } from "./resizeImages";
import { RuntimeConfigContext } from "../../components/RuntimeContext";
import ValueWithLabel from "../../components/ValueWithLabel";
import useS3Client from "../../hooks/useS3Client";

interface S3Image {
  data: Blob;
  type: string;
  key: string;
}

/**
 * Component to render the product data generator page.
 */
const GenProductData: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [productMetadata, setProductMetadata] = useState<string>("");
  const [examples, setExamples] = useState<ProductData[]>([]);
  const [llmOptions, setLLMOptions] = useState<LLMOptions>({});
  const [s3Images, setS3Images] = useState<S3Image[]>([]);
  const [status, setStatus] = useState<string>("");
  const [flashItems, setFlashItems] = useState<
    FlashbarProps.MessageDefinition[]
  >([]);

  const { getAuthenticatedUser } = useCognitoAuthContext();
  const runtimeCtx = useContext(RuntimeConfigContext);
  const bucket: string = runtimeCtx?.imagesBucket;
  const s3Client = useS3Client();

  const generateProduct = useGenerateProduct({
    onSettled: () => setStatus(""),
    onError: (error) => {
      console.log(error);
      const id = new Date().getTime().toString();
      setStatus("Error");
      setFlashItems((items) => {
        items.push({
          id: id,
          type: "error",
          dismissible: true,
          content: "Failed to generate product data",
          onDismiss: () =>
            setFlashItems((prev) => prev.filter((f) => f.id !== id)),
        });
        return items;
      });
    },
    onSuccess: (data) => {
      const id = new Date().getTime().toString();
      setStatus("Success");
      setFlashItems((items) => {
        items.push({
          id: id,
          type: "success",
          dismissible: true,
          content: "Product data generated successfully",
          onDismiss: () =>
            setFlashItems((prev) => prev.filter((f) => f.id !== id)),
        });
        return items;
      });
      console.log(data);
    },
  });

  async function uploadImageToS3(image: S3Image) {
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: image.key,
      ContentType: image.type,
      Body: image.data,
    });

    try {
      await s3Client.send(putCommand);
    } catch (error) {
      console.log(`Failed to upload s3://${bucket}/${image.key}`);
      throw error;
    }
  }

  async function generateProductData() {
    console.log("Generate product data");
    let imageKeys = s3Images;
    if (s3Images.length === 0) {
      console.log("Prepare images for upload");
      setStatus("Preparing");
      const images = await prepareImages(imageFiles);

      console.log("Upload images to S3");
      setStatus("Uploading");
      const cognitoUser = getAuthenticatedUser();
      const user = cognitoUser?.getUsername();
      const prefixBuffer = await window.crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(user),
      );
      const prefix = Array.from(new Uint8Array(prefixBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      console.log(prefix);
      imageKeys = images.map((img) => {
        return {
          data: img.data,
          type: img.type,
          key: `${prefix}/${img.name}`,
        };
      });
      const uploads = imageKeys.map(uploadImageToS3);
      await Promise.all(uploads);
      setS3Images(imageKeys);
    }

    console.log("Request product data");
    setStatus("Generating");
    generateProduct.mutate({
      genProductRequestContent: {
        language: llmOptions.language,
        productImages: imageKeys.map((img) => img.key),
        metadata: productMetadata,
        model: llmOptions.model
          ? (llmOptions.model.value as GenProductRequestContentModelEnum)
          : undefined,
        temperature: llmOptions.temperature,
        descriptionLength: llmOptions.descriptionLength,
        examples: examples,
      },
    });
  }

  return (
    <ContentLayout
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  generateProduct.reset();
                  setImageFiles([]);
                  setS3Images([]);
                  setProductMetadata("");
                  setLLMOptions({});
                  setStatus("");
                }}
                variant="normal"
              >
                New Product
              </Button>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  void generateProductData();
                }}
                loading={status !== ""}
                disabled={status !== ""}
                loadingText={generateProduct.isLoading ? "Generating" : status}
              >
                Generate
              </Button>
            </SpaceBetween>
          }
        >
          Product Data Generator
        </Header>
      }
    >
      <Flashbar items={flashItems} />
      {generateProduct.isIdle && (
        <NewProductForm
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          productMetadata={productMetadata}
          setProductMetadata={setProductMetadata}
          llmOptions={llmOptions}
          setLLMOptions={setLLMOptions}
          examples={examples}
          setExamples={setExamples}
        />
      )}
      {status !== "" && <Spinner></Spinner>}
      {(generateProduct.isSuccess || generateProduct.isError) && (
        <Container>
          <SpaceBetween size="l" direction="vertical">
            {generateProduct.isSuccess && (
              <SpaceBetween size="m" direction="vertical">
                <TextContent>
                  <h1>{generateProduct.data.title}</h1>
                  <div>
                    {generateProduct.data.description
                      .split("\n")
                      .filter((paragraph) => paragraph.trim() !== "")
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </TextContent>
                {generateProduct.data.usage !== undefined && (
                  <ExpandableSection headerText="Details">
                    <SpaceBetween size="l" direction="horizontal">
                      <ValueWithLabel label="Input tokens">
                        {generateProduct.data.usage?.inputTokens}
                      </ValueWithLabel>
                      <ValueWithLabel label="Output tokens">
                        {generateProduct.data.usage?.outputTokens}
                      </ValueWithLabel>
                    </SpaceBetween>
                  </ExpandableSection>
                )}
              </SpaceBetween>
            )}
            <RefineProductForm
              productMetadata={productMetadata}
              setProductMetadata={setProductMetadata}
              llmOptions={llmOptions}
              setLLMOptions={setLLMOptions}
              examples={examples}
              setExamples={setExamples}
              expanded={generateProduct.isError}
            />
          </SpaceBetween>
        </Container>
      )}
    </ContentLayout>
  );
};

export default GenProductData;
