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

import { readAndCompressImage } from "browser-image-resizer";

export const imageResizeConfig = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.7,
};

export async function resizeImage(file: File) {
  const image = await readAndCompressImage(file, {
    ...imageResizeConfig,
    mimeType: file.type,
  });
  return image;
}

export interface ProductImage {
  data: Blob;
  type: string;
  name: string;
}

export async function prepareImages(files: File[]): Promise<ProductImage[]> {
  const resizedImages = await Promise.all(
    files.map(async (file): Promise<ProductImage> => {
      return {
        data: await resizeImage(file),
        type: file.type,
        name: file.name,
      };
    }),
  );
  return resizedImages;
}
