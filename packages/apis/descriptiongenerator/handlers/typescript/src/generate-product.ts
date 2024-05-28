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

import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import Anthropic, { AnthropicError } from "@anthropic-ai/sdk";
import { ImageBlockParam, MessageParam } from "@anthropic-ai/sdk/resources";
import { Logger } from "@aws-lambda-powertools/logger";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  GenerateProductChainedHandlerFunction,
  generateProductHandler,
  INTERCEPTORS,
  LoggingInterceptor,
  Response,
} from "descriptiongenerator-typescript-runtime";
import { XMLParser } from "fast-xml-parser";

const logger = new Logger({ serviceName: "GenerateProduct" });

const defaultTemperature = 0.1;
const defaultModel = "anthropic.claude-3-haiku-20240307-v1:0";

type ImageTypes = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export interface Base64Image {
  data: string;
  contentType: ImageTypes;
}

export interface ProductData {
  title: string;
  description: string;
}

export function parseProductXml(xml: string): ProductData {
  const parser = new XMLParser();
  try {
    const doc = parser.parse(xml);
    return {
      title: doc.product.title! as string,
      description: doc.product.description! as string,
    };
  } catch (error) {
    logger.debug(`Error parsing product XML: ${xml}`);
    throw Response.internalFailure({
      message: "Model output error",
    });
  }
}

/**
 * Get images from S3 and prepare them for use in the model
 *
 * @param s3Client
 * @param bucket
 * @param imageKeys
 * @returns Base64Image[]
 */
async function getImages(
  s3Client: S3Client,
  bucket: string,
  imageKeys: string[],
): Promise<Base64Image[]> {
  const imagePromises = imageKeys.map(async (key): Promise<Base64Image> => {
    const image = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    logger.debug(
      `Got ${key} with type ${image.ContentType} and size ${image.ContentLength}`,
    );
    if (!image.Body) {
      throw Response.badRequest({ message: `Image ${key} has no body!` });
    }
    if (!image.ContentType) {
      throw Response.badRequest({
        message: `Image ${key} has no content type!`,
      });
    }
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        image.ContentType,
      )
    ) {
      throw Response.badRequest({
        message: `Image ${key} has an invalid content type!`,
      });
    }
    return {
      data: await image.Body!.transformToString("base64"),
      contentType: image.ContentType as ImageTypes,
    };
  });

  return Promise.all(imagePromises);
}

function getParagraphCount(descriptionLength: string) {
  switch (descriptionLength) {
    case "short":
      return "one paragraph";
    case "medium":
      return "three paragraphs";
    case "long":
      return "five paragraphs";
    default:
      throw Response.badRequest({
        message: `Invalid description length: ${descriptionLength}`,
      });
  }
}

function formatExamples(examples: ProductData[]): string {
  return examples
    .map(
      (example) =>
        `<product>\n<title>${example.title}</title>\n<description>${example.description}</description>\n</product>`,
    )
    .join("\n");
}

export interface PreparePromptProps {
  images: Base64Image[];
  language?: string;
  descriptionLength?: string;
  metadata?: string;
  examples?: ProductData[];
}

/**
 * Prepare the prompt
 * @param props PreparePromptProps
 * @returns MessageParam
 */
export function preparePrompt(props: PreparePromptProps): {
  systemPrompt: string;
  prompt: MessageParam;
} {
  const { images, language, descriptionLength, metadata, examples } = props;
  const imageBlocks: ImageBlockParam[] = [];
  for (const image of images) {
    imageBlocks.push({
      type: "image",
      source: {
        data: image.data,
        media_type: image.contentType,
        type: "base64",
      },
    });
  }
  const paragraphCount = descriptionLength
    ? getParagraphCount(descriptionLength)
    : "";

  let userPrompt = `Please create a title and a description ${descriptionLength ? `with ${paragraphCount} ` : ""}${examples ? "following the language, style, and tone provided in <examples> " : ""}${language ? `in ${language} ` : ""} for the product shown in the ${
    images.length > 1 ? "images" : "image"
  }${metadata !== undefined ? " and metadata in <metadata>" : ""}.`;
  if (metadata) {
    userPrompt += `\n\n<metadata>${metadata}</metadata>`;
  }
  logger.debug(`Prompt: ${userPrompt}`);

  let systemPrompt = "";

  if (examples) {
    systemPrompt += `<examples>\n${formatExamples(examples)}</examples>\n\n`;
  }

  systemPrompt += `You are responsible for creating enticing and informative titles and descriptions for products on an e-commerce site. The products are targeted towards a general consumer audience and cover a wide range of categories, such as electronics, home goods, and apparel.

  Output Format:
  Please respond in the following XML format:
  
  <product>
      <title>Concise, engaging title (up to 60 characters)</title>
      <description>Informative description ${paragraphCount} highlighting key features, benefits, and use cases. Multiple paragraphs are separated by newline characters.</description>
  </product>
  
  Guidelines:
  - Title: Keep it short, clear, and attention-grabbing
  - Description: Emphasize the most important details about the product${
    examples
      ? `
  - Use the language, style, and tone demonstrated in <examples>`
      : `
  - Tone: Friendly and conversational, tailored to the target audience`
  }${
    descriptionLength
      ? `
  - Description length: ${paragraphCount}`
      : ""
  }
  - Any additional metadata or constraints will be provided in <metadata> tags
  - Respond in the above XML format with exactly one <product> that contains exactly one <title> and exactly one <description>. <title> and <description> contain only strings and no other tags.
`;

  logger.debug(`System Prompt: ${systemPrompt}`);
  const prompt: MessageParam = {
    role: "user",
    content: [
      ...imageBlocks,
      {
        type: "text",
        text: userPrompt,
      },
    ],
  };

  return { systemPrompt, prompt };
}

/**
 * Call the LLM to create the title and description.
 * @param bedrockClient
 * @param model
 * @param temperature
 * @param systemPrompt
 * @param prompt
 * @returns GeneratedProduct
 */
export async function generateProductTitleAndDescription(
  bedrockClient: AnthropicBedrock,
  model: string,
  temperature: number,
  systemPrompt: string,
  prompt: MessageParam,
): Promise<{ productData: ProductData; usage: Anthropic.Usage }> {
  const response = await bedrockClient.messages.create({
    model: model,
    max_tokens: 1024,
    temperature: temperature,
    stop_sequences: ["</product>"],
    system: systemPrompt,
    messages: [prompt, { role: "assistant", content: "<product>" }],
  });
  logger.debug(`Response: ${JSON.stringify(response)}`);

  // Add the <product> tags back to the response.
  const productResponse = `<product>${response.content[0].text}</product>`;

  // Parse the XML response into an object.
  const productData = parseProductXml(productResponse);

  const usage = response.usage;
  return { productData, usage };
}

/**
 * Type-safe handler for the GenerateProduct operation
 */
export const generateProduct: GenerateProductChainedHandlerFunction = async (
  request,
) => {
  LoggingInterceptor.getLogger(request).info("Start GenerateProduct Operation");
  const s3Client = new S3Client({});
  const bedrockClient = new AnthropicBedrock({});

  LoggingInterceptor.getLogger(request).debug("Input: ", request.input);

  const bucket = process.env.IMAGE_BUCKET;
  if (!bucket) {
    logger.error("IMAGE_BUCKET environment variable not set!");
    throw Response.internalFailure({ message: "Internal server error" });
  }
  const model = request.input.body.model || defaultModel;
  if (!model) {
    logger.error("model variable not set");
    throw Response.internalFailure({ message: "Internal server error" });
  }
  const temperature = request.input.body.temperature || defaultTemperature;
  if (isNaN(temperature)) {
    logger.error("temperature not set");
    throw Response.internalFailure({ message: "Internal server error" });
  }
  if (temperature < 0 || temperature > 1) {
    throw Response.badRequest({
      message: "Temperature must be between 0 and 1",
    });
  }

  const language = request.input.body.language;
  const productMetadata = request.input.body.metadata;
  const imageKeys = request.input.body.productImages;
  const descriptionLength = request.input.body.descriptionLength;
  const examples = request.input.body.examples;

  let images: Base64Image[];
  try {
    images = await getImages(s3Client, bucket, imageKeys);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to get images. ${error.name}: ${error.message}`);
      if (error.stack) {
        logger.error(error.stack);
      }
    }
    throw Response.internalFailure({ message: "Failed to get images" });
  }

  let systemPrompt: string;
  let prompt: MessageParam;
  try {
    ({ systemPrompt, prompt } = preparePrompt({
      images,
      language,
      descriptionLength,
      metadata: productMetadata,
      examples,
    }));
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to prepare prompt. ${error.name}: ${error.message}`);
      if (error.stack) {
        logger.error(error.stack);
      }
    }
    throw Response.internalFailure({ message: "Failed to prepare prompt" });
  }
  let productData: ProductData;
  let usage: Anthropic.Usage;
  try {
    ({ productData, usage } = await generateProductTitleAndDescription(
      bedrockClient,
      model,
      temperature,
      systemPrompt,
      prompt,
    ));
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        `Failed to generate product data. ${error.name}: ${error.message}`,
      );
      if (error.stack) {
        logger.error(error.stack);
      }
    }
    if (error instanceof AnthropicError) {
      /**
       * Status Code 	Error Type
       * 400 	BadRequestError
       * 401 	AuthenticationError
       * 403 	PermissionDeniedError
       * 404 	NotFoundError
       * 422 	UnprocessableEntityError
       * 429 	RateLimitError
       * >=500 	InternalServerError
       * N/A 	APIConnectionError
       */
      switch (error.name) {
        case "BadRequestError":
          throw Response.badRequest({ message: "Bad request" });
        case "AuthenticationError":
          throw Response.notAuthorized({ message: "Unauthorized" });
        case "PermissionDeniedError":
          throw Response.notAuthorized({ message: "Forbidden" });
        case "NotFoundError":
          throw Response.notFound({ message: "Not Found" });
        case "UnprocessableEntityError":
          throw Response.badRequest({ message: "Unprocessable content" });
        case "RateLimitError":
          throw Response.internalFailure({
            message: "Bedrock rate limit exceeded",
          });
        default:
          throw Response.internalFailure({ message: "Internal server error" });
      }
    }
    throw Response.internalFailure({
      message: "Failed to generate product data",
    });
  }

  return Response.success({
    title: productData.title,
    description: productData.description,
    usage: {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
    },
  });
};

/**
 * Entry point for the AWS Lambda handler for the GenerateProduct operation.
 * The generateProductHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = generateProductHandler(...INTERCEPTORS, generateProduct);
