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

import FileUpload from "@cloudscape-design/components/file-upload";
import FormField from "@cloudscape-design/components/form-field";
import { useState } from "react";

type ImageError = string | null;

export interface ImageUploaderProps {
  value: File[];
  setValue: (value: File[]) => void;
}

const maxImages = 20;
const ImageUploader: React.FC<ImageUploaderProps> = (
  props: ImageUploaderProps,
) => {
  const { value, setValue } = props;
  const [errorList, setErrorList] = useState<ImageError[]>([]);
  const [error, setError] = useState<string | undefined>();

  const validateImage = (file: File): ImageError => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "The image must be in JPG, PNG, GIF, or WebP format";
    }
    return null;
  };

  return (
    <FormField
      label="Upload Images"
      description="Upload images of your product"
      errorText={error}
    >
      <FileUpload
        onChange={({ detail }) => {
          if (detail.value.length > maxImages) {
            setError(`Please use fewer than ${maxImages} images`);
            return;
          } else if (detail.value.length === 0) {
            setError("Please use at least one image");
          } else {
            setError(undefined);
          }
          setValue(detail.value);
          setErrorList(detail.value.map(validateImage));
        }}
        value={value}
        i18nStrings={{
          uploadButtonText: (e) => (e ? "Choose images" : "Choose image"),
          dropzoneText: (e) =>
            e ? "Drop images to upload" : "Drop image to upload",
          removeFileAriaLabel: (e) => `Remove image ${e + 1}`,
          limitShowFewer: "Show fewer images",
          limitShowMore: "Show more images",
          errorIconAriaLabel: "Error",
        }}
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp"
        fileErrors={errorList}
        showFileLastModified
        showFileSize
        showFileThumbnail
        tokenLimit={3}
        constraintText="Supported image formats are JPEG, PNG, GIF, and WebP."
      />
    </FormField>
  );
};

export default ImageUploader;
