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
import {
  aws_cognito as cognito,
  aws_s3 as s3,
  Duration,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import { ComawsgenproductdescriptionDescriptionGenerator } from "../constructs/apis/comawsgenproductdescriptiondescriptiongenerator";
import { SecureBucket } from "../constructs/secure-bucket";
import { Productdescriptiondemo } from "../constructs/websites/productdescriptiondemo";

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imagesBucket = new SecureBucket(this, "ProductImagesBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(3),
        },
      ],
      cors: [
        {
          allowedHeaders: ["*"],
          allowedOrigins: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
          ],
        },
      ],
    });

    const userPool = new cognito.UserPool(this, "DemoUserPool", {
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      mfa: cognito.Mfa.OPTIONAL,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
      },
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
    });

    NagSuppressions.addResourceSuppressions(
      userPool,
      [
        {
          id: "AwsSolutions-COG2",
          reason:
            "The Cognito User Pool is used for demo purposes only. In production, MFA should be required.",
        },
        {
          id: "AwsSolutions-IAM5",
          reason: "The Cognito SMS Role has wildcards to send SMS MFA tokens.",
        },
      ],
      true,
    );

    const userIdentity = new UserIdentity(this, `${id}UserIdentity`, {
      userPool: userPool,
    });

    imagesBucket.grantReadWrite(userIdentity.identityPool.authenticatedRole);

    const comawsgenproductdescriptiondescriptiongenerator =
      new ComawsgenproductdescriptionDescriptionGenerator(
        this,
        "ComawsgenproductdescriptionDescriptionGenerator",
        {
          userIdentity,
          imageBucket: imagesBucket,
        },
      );
    new Productdescriptiondemo(this, "Productdescriptiondemo", {
      userIdentity,
      comawsgenproductdescriptiondescriptiongenerator,
      imagesBucket: imagesBucket.bucketName,
    });

    NagSuppressions.addResourceSuppressionsByPath(
      Stack.of(this),
      `/${
        Stack.of(this).node.path
      }/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C`,
      [
        {
          id: "AwsSolutions-IAM4",
          reason:
            "AWSLambdaBasicExecution Managed policy used to expedite development.",
        },
        {
          id: "AwsSolutions-IAM5",
          reason:
            "The CDKBucketDeployment Role has wildcards to manage all resources in a specific bucket.",
        },
        {
          id: "AwsSolutions-L1",
          reason:
            "The Lambda runtime is managed upstream by AWS PDK. Keep PDK up to date to ensure the runtime version gets updated.",
        },
      ],
      true,
    );
  }
}
