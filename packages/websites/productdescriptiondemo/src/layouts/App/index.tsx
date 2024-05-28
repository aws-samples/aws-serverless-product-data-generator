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

import { useCognitoAuthContext } from "@aws-northstar/ui";
import NavHeader from "@aws-northstar/ui/components/AppLayout/components/NavHeader";
import getBreadcrumbs from "@aws-northstar/ui/components/AppLayout/utils/getBreadcrumbs";
import {
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  SideNavigation,
} from "@cloudscape-design/components";
import AppLayout, {
  AppLayoutProps,
} from "@cloudscape-design/components/app-layout";
import * as React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavItems } from "./navitems";
import Config from "../../config.json";
import Routes from "../Routes";

/**
 * Context for updating/retrieving the AppLayout.
 */
export const AppLayoutContext = createContext({
  appLayoutProps: {},
  setAppLayoutProps: (_: AppLayoutProps) => {},
});

/**
 * Defines the App layout and contains logic for routing.
 */
const App: React.FC = () => {
  const [username, setUsername] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const { getAuthenticatedUser } = useCognitoAuthContext();

  const navigate = useNavigate();
  const [activeHref, setActiveHref] = useState("/");
  const [activeBreadcrumbs, setActiveBreadcrumbs] = useState<
    BreadcrumbGroupProps.Item[]
  >([{ text: "/", href: "/" }]);
  const [appLayoutProps, setAppLayoutProps] = useState<AppLayoutProps>({});
  const location = useLocation();

  useEffect(() => {
    const authUser = getAuthenticatedUser();
    setUsername(authUser?.getUsername());

    authUser?.getSession(() => {
      authUser.getUserAttributes((_, attributes) => {
        setEmail(attributes?.find((a) => a.Name === "email")?.Value);
      });
    });
  }, [getAuthenticatedUser, setUsername, setEmail]);

  const setAppLayoutPropsSafe = useCallback(
    (props: AppLayoutProps) => {
      JSON.stringify(appLayoutProps) !== JSON.stringify(props) &&
        setAppLayoutProps(props);
    },
    [appLayoutProps],
  );

  useEffect(() => {
    setActiveHref(location.pathname);
    const breadcrumbs = getBreadcrumbs(location.pathname, location.search, "/");
    setActiveBreadcrumbs(breadcrumbs);
  }, [location]);

  const onNavigate = useCallback(
    (e: CustomEvent<{ href: string; external?: boolean }>) => {
      if (!e.detail.external) {
        e.preventDefault();
        setAppLayoutPropsSafe({
          contentType: undefined,
          splitPanelOpen: false,
          splitPanelSize: undefined,
          splitPanelPreferences: undefined,
        });
        navigate(e.detail.href);
      }
    },
    [navigate],
  );

  return (
    <AppLayoutContext.Provider
      value={{ appLayoutProps, setAppLayoutProps: setAppLayoutPropsSafe }}
    >
      <NavHeader
        title={Config.applicationName}
        logo={Config.logo}
        user={
          username
            ? {
                username,
                email,
              }
            : undefined
        }
        onSignout={() =>
          new Promise(() => {
            getAuthenticatedUser()?.signOut();
            window.location.href = "/";
          })
        }
      />
      <AppLayout
        breadcrumbs={
          <BreadcrumbGroup onFollow={onNavigate} items={activeBreadcrumbs} />
        }
        toolsHide
        navigation={
          <SideNavigation
            header={{ text: Config.applicationName, href: "/" }}
            activeHref={activeHref}
            onFollow={onNavigate}
            items={NavItems}
          />
        }
        content={<Routes />}
        splitPanelOpen={false}
        splitPanelPreferences={{ position: "bottom" }}
        {...appLayoutProps}
      />
    </AppLayoutContext.Provider>
  );
};

export default App;
