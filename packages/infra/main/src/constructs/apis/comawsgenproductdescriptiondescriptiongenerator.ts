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

import { UserIdentity } from "@aws/pdk/identity";
import { Authorizers, Integrations } from "@aws/pdk/type-safe-api";
import {
  aws_bedrock as bedrock,
  aws_lambda as lambda,
  aws_s3 as s3,
  Stack,
} from "aws-cdk-lib";
import { Cors } from "aws-cdk-lib/aws-apigateway";
import {
  AccountPrincipal,
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import {
  Api,
  GenerateProductFunction,
} from "descriptiongenerator-typescript-infra";

/**
 * Api construct props.
 */
export interface ComawsgenproductdescriptionDescriptionGeneratorProps {
  /**
   * Instance of the UserIdentity.
   */
  readonly userIdentity: UserIdentity;
  readonly imageBucket: s3.IBucket;
}

/**
 * Infrastructure construct to deploy a Type Safe API.
 */
export class ComawsgenproductdescriptionDescriptionGenerator extends Construct {
  /**
   * API instance
   */
  public readonly api: Api;

  constructor(
    scope: Construct,
    id: string,
    props: ComawsgenproductdescriptionDescriptionGeneratorProps,
  ) {
    super(scope, id);

    const generateProductFunction = new GenerateProductFunction(
      this,
      "GenerateProductFunction",
      {
        environment: {
          IMAGE_BUCKET: props.imageBucket.bucketName,
        },
        memorySize: 512,
        architecture: lambda.Architecture.ARM_64,
      },
    );
    props.imageBucket.grantRead(generateProductFunction);

    const haiku = bedrock.FoundationModel.fromFoundationModelId(
      this,
      "Claude3Haiku",
      bedrock.FoundationModelIdentifier.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,
    );
    const sonnet = bedrock.FoundationModel.fromFoundationModelId(
      this,
      "Claude3Sonnet",
      bedrock.FoundationModelIdentifier.ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0,
    );
    const opus = bedrock.FoundationModel.fromFoundationModelId(
      this,
      "Claude3Opus",
      bedrock.FoundationModelIdentifier.ANTHROPIC_CLAUDE_3_OPUS_20240229_V1_0,
    );

    generateProductFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [haiku.modelArn, sonnet.modelArn, opus.modelArn],
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
      }),
    );

    NagSuppressions.addResourceSuppressions(
      generateProductFunction,
      [
        {
          id: "AwsSolutions-IAM4",
          reason:
            "Lambda Basic Execution Managed Policy used to expedite development.",
        },
        {
          id: "AwsSolutions-IAM5",
          reason:
            "This policy has wildcards to read and objects from a specific S2 bucket.",
        },
      ],
      true,
    );

    this.api = new Api(this, id, {
      defaultAuthorizer: Authorizers.iam(),
      corsOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      integrations: {
        generateProduct: {
          integration: Integrations.lambda(generateProductFunction),
        },
      },
      policy: new PolicyDocument({
        statements: [
          // Here we grant any AWS credentials from the account that the prototype is deployed in to call the api.
          // Machine to machine fine-grained access can be defined here using more specific principals (eg roles or
          // users) and resources (ie which api paths may be invoked by which principal) if required.
          // If doing so, the cognito identity pool authenticated role must still be granted access for cognito users to
          // still be granted access to the API.
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AccountPrincipal(Stack.of(this).account)],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*"],
          }),
          // Open up OPTIONS to allow browsers to make unauthenticated preflight requests
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*/OPTIONS/*"],
          }),
        ],
      }),
    });

    NagSuppressions.addResourceSuppressions(
      this,
      [
        {
          id: "AwsSolutions-L1",
          reason:
            "Lambda runtime versions managed upstream in PDK. Keep PDK up to date to ensure the runtime version gets updated.",
        },
      ],
      true,
    );

    // Grant authenticated users access to invoke the api
    props.userIdentity.identityPool.authenticatedRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["execute-api:Invoke"],
        resources: [this.api.api.arnForExecuteApi("*", "/*", "*")],
      }),
    );
    NagSuppressions.addResourceSuppressions(
      props!.userIdentity.identityPool.authenticatedRole,
      [
        {
          id: "AwsSolutions-IAM5",
          reason:
            "The Cognito Authenticated Role has wildcards call any resource from the api.",
        },
      ],
      true,
    );
  }
}
