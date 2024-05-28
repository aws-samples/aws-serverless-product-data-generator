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
import { StaticWebsite } from "@aws/pdk/static-website";
import { Stack } from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";
import { ComawsgenproductdescriptionDescriptionGenerator } from "../apis/comawsgenproductdescriptiondescriptiongenerator";

/**
 * Website construct props
 */
export interface ProductdescriptiondemoProps {
  /**
   * Instance of an API to configure the website to integrate with
   */
  readonly comawsgenproductdescriptiondescriptiongenerator: ComawsgenproductdescriptionDescriptionGenerator;

  /**
   * Instance of the UserIdentity.
   */
  readonly userIdentity: UserIdentity;
  readonly imagesBucket: string;
}

/**
 * Construct to deploy a Static Website
 */
export class Productdescriptiondemo extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props?: ProductdescriptiondemoProps,
  ) {
    super(scope, id);

    const website = new StaticWebsite(this, id, {
      websiteContentPath: "../../websites/productdescriptiondemo/build",
      runtimeOptions: {
        jsonPayload: {
          region: Stack.of(this).region,
          identityPoolId: props?.userIdentity.identityPool.identityPoolId,
          userPoolId: props?.userIdentity.userPool?.userPoolId,
          userPoolWebClientId:
            props?.userIdentity.userPoolClient?.userPoolClientId,
          typeSafeApis: {
            "com.aws.genproductdescription.DescriptionGenerator":
              props?.comawsgenproductdescriptiondescriptiongenerator.api.api.urlForPath(),
          },
          typeSafeWebSocketApis: {},
          imagesBucket: props?.imagesBucket,
        },
      },
    });

    NagSuppressions.addResourceSuppressions(
      website,
      [
        {
          id: "AwsSolutions-CFR1",
          reason:
            "Suppressed to allow unrestricted access. Not recommended in production.",
        },
      ],
      true,
    );
  }
}
