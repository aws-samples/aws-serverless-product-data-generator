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

import * as React from "react";
import { Route, Routes as ReactRoutes } from "react-router-dom";
import ApiExplorer from "../../pages/ApiExplorer";
import GenProductData from "../../pages/GenProductData";
import Home from "../../pages/Home";

/**
 * Defines the Routes.
 */
const Routes: React.FC = () => {
  return (
    <ReactRoutes>
      <Route key={0} path="/" element={<Home />} />
      <Route key={0} path="/genProductData" element={<GenProductData />} />
      <Route key={0} path="/apiExplorer" element={<ApiExplorer />} />
    </ReactRoutes>
  );
};

export default Routes;
