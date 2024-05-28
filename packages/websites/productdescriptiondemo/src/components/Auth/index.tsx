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

import { CognitoAuth } from "@aws-northstar/ui";
import React, { useContext } from "react";
import Config from "../../config.json";
import { RuntimeConfigContext } from "../RuntimeContext";

/**
 * Sets up the Cognito auth.
 *
 * This assumes a runtime-config.json file is present at '/'. In order for Auth to be set up automatically,
 * the runtime-config.json must have the following properties configured: [region, userPoolId, userPoolWebClientId, identityPoolId].
 */
const Auth: React.FC<any> = ({ children }) => {
  const runtimeContext = useContext(RuntimeConfigContext);

  return runtimeContext?.userPoolId &&
    runtimeContext?.userPoolWebClientId &&
    runtimeContext?.region &&
    runtimeContext?.identityPoolId ? (
    <CognitoAuth
      header={Config.applicationName}
      userPoolId={runtimeContext.userPoolId}
      clientId={runtimeContext.userPoolWebClientId}
      region={runtimeContext.region}
      identityPoolId={runtimeContext.identityPoolId}
    >
      {children}
    </CognitoAuth>
  ) : (
    <></>
  );
};

export default Auth;
