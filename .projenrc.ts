import { CloudscapeReactTsWebsiteProject } from "@aws/pdk/cloudscape-react-ts-website";
import { InfrastructureTsProject } from "@aws/pdk/infrastructure";
import { MonorepoTsProject } from "@aws/pdk/monorepo";
import {
  DocumentationFormat,
  Language,
  Library,
  ModelLanguage,
  NodeVersion,
  TypeSafeApiProject,
} from "@aws/pdk/type-safe-api";
import { javascript } from "projen";

const monorepo = new MonorepoTsProject({
  name: "monorepo",
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  prettier: true,
  gitignore: [".idea", ".vscode"],
  devDeps: ["@types/jest"],
  license: "MIT-0",
  copyrightOwner: "Amazon.com Inc. or its affiliates",
  licenseOptions: {
    spdx: "MIT-0",
    copyrightOwner: "Amazon.com Inc. or its affiliates",
  },
});

const descriptiongenerator = new TypeSafeApiProject({
  parent: monorepo,
  outdir: "packages/apis/descriptiongenerator",
  name: "descriptiongenerator",
  infrastructure: {
    language: Language.TYPESCRIPT,
    options: {
      typescript: {
        license: "MIT-0",
        copyrightOwner: "Amazon.com Inc. or its affiliates",
      },
    },
  },
  runtime: {
    languages: [Language.TYPESCRIPT],
    options: {
      typescript: {
        license: "MIT-0",
        copyrightOwner: "Amazon.com Inc. or its affiliates",
      },
    },
  },
  model: {
    language: ModelLanguage.OPENAPI,
    options: {
      openapi: {
        title: "com.aws.genproductdescription.DescriptionGenerator",
      },
    },
  },
  documentation: {
    formats: [DocumentationFormat.HTML_REDOC, DocumentationFormat.MARKDOWN],
  },
  library: {
    libraries: [Library.TYPESCRIPT_REACT_QUERY_HOOKS],
    options: {
      typescriptReactQueryHooks: {
        license: "MIT-0",
        copyrightOwner: "Amazon.com Inc. or its affiliates",
      },
    },
  },
  handlers: {
    languages: [Language.TYPESCRIPT],
    options: {
      typescript: {
        deps: [
          "@anthropic-ai/bedrock-sdk",
          "@anthropic-ai/sdk",
          "@aws-sdk/client-bedrock-runtime",
          "@aws-sdk/client-s3",
          "@aws-lambda-powertools/logger@^2.1.0",
          "fast-xml-parser@^4.3.6",
        ],
        runtimeVersion: NodeVersion.NODE_20,
        prettier: true,
        license: "MIT-0",
        copyrightOwner: "Amazon.com Inc. or its affiliates",
      },
    },
  },
});

const productdescriptiondemo = new CloudscapeReactTsWebsiteProject({
  parent: monorepo,
  outdir: "packages/websites/productdescriptiondemo",
  name: "productdescriptiondemo",
  applicationName: "Product Description Demo",
  license: "MIT-0",
  copyrightOwner: "Amazon.com Inc. or its affiliates",
  typeSafeApis: [descriptiongenerator],
  deps: [
    "@aws-sdk/client-s3",
    "@aws-sdk/core",
    "@aws-sdk/types",
    "browser-image-resizer@^2.4.1",
  ],
  prettier: true,
});
monorepo.package.addPackageResolutions(
  "aws-cdk-lib@^2.155.0",
  "axios@^1.7.4",
  "body-parser@^1.20.3",
  "dompurify@^3.1.3",
  "express@^4.20.0",
  "fast-xml-parser@^4.4.1",
  "micromatch@^4.0.8",
  "nth-check@^2.1.1",
  "postcss@^8.4.38",
  "rollup@^2.79.2",
  "semver@^7.6.2",
  "send@^0.19.0",
  "serve-static@^1.16.0",
  "webpack@^5.94.0",
  "ws@^8.17.1",
);

new InfrastructureTsProject({
  parent: monorepo,
  outdir: "packages/infra/main",
  name: "infra",
  cloudscapeReactTsWebsites: [productdescriptiondemo],
  typeSafeApis: [descriptiongenerator],
  prettier: true,
  license: "MIT-0",
  copyrightOwner: "Amazon.com Inc. or its affiliates",
});

monorepo.synth();
