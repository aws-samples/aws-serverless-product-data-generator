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

import ErrorMessage from "@aws-northstar/ui/components/CognitoAuth/components/ErrorMessage";
import { Spinner } from "@cloudscape-design/components";
import React, { createContext, useEffect, useState } from "react";

export interface RuntimeContext {
  readonly region: string;
  readonly userPoolId: string;
  readonly userPoolWebClientId: string;
  readonly identityPoolId: string;
  readonly [additionalProps: string]: any;
}

/**
 * Context for storing the runtimeContext.
 */
export const RuntimeConfigContext = createContext<RuntimeContext | undefined>(
  undefined,
);

/**
 * Sets up the runtimeContext.
 *
 * This assumes a runtime-config.json file is present at '/'. In order for Auth to be set up automatically,
 * the runtime-config.json must have the following properties configured: [region, userPoolId, userPoolWebClientId, identityPoolId].
 */
const RuntimeContextProvider: React.FC<any> = ({ children }) => {
  const [runtimeContext, setRuntimeContext] = useState<
    RuntimeContext | undefined
  >();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    fetch("/runtime-config.json")
      .then((response) => {
        return response.json();
      })
      .then((runtimeCtx) => {
        if (
          runtimeCtx.region &&
          runtimeCtx.userPoolId &&
          runtimeCtx.userPoolWebClientId &&
          runtimeCtx.identityPoolId
        ) {
          setRuntimeContext(runtimeCtx as RuntimeContext);
        } else {
          setError(
            "runtime-config.json should have region, userPoolId, userPoolWebClientId & identityPoolId.",
          );
        }
      })
      .catch(() => {
        setError("No runtime-config.json detected");
      });
  }, [setRuntimeContext]);

  return error ? (
    <ErrorMessage>{error}</ErrorMessage>
  ) : runtimeContext ? (
    <RuntimeConfigContext.Provider value={runtimeContext}>
      {children}
    </RuntimeConfigContext.Provider>
  ) : (
    <Spinner></Spinner>
  );
};

export default RuntimeContextProvider;
