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

import Anthropic from "@anthropic-ai/sdk";
import { parseProductXml, preparePrompt } from "../src/generate-product";

describe("parseProductXml", () => {
  it("should parse valid XML and return ProductData", () => {
    const validXml = `
        <product>
          <title>Example Product</title>
          <description>This is an example short product description.</description>
        </product>
      `;

    const productData = parseProductXml(validXml);
    expect(productData.title).toBe("Example Product");
    expect(productData.description).toBe(
      "This is an example short product description.",
    );
  });

  it("should parse valid XML with medium description and return ProductData", () => {
    const validXml = `
        <product>
          <title>Example Product</title>
          <description>This is an example medium product description.</description>
        </product>
      `;

    const productData = parseProductXml(validXml);
    expect(productData.title).toBe("Example Product");
    expect(productData.description).toBe(
      "This is an example medium product description.",
    );
  });

  it("should throw an error for invalid XML", () => {
    const invalidXml = "This is not valid XML";
    expect(() => parseProductXml(invalidXml)).toThrow(
      expect.objectContaining({
        body: { message: "Model output error" },
        statusCode: 500,
      }),
    );
  });
});

describe("preparePrompt", () => {
  it("should include the description length in the prompt", () => {
    const { prompt } = preparePrompt({
      images: [{ data: "example", contentType: "image/jpeg" }],
      language: "English",
      descriptionLength: "short",
    });
    expect((prompt.content[1] as Anthropic.TextBlockParam).text).toContain(
      "one paragraph",
    );
  });
});
