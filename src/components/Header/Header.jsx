import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Theme,
  Header as CarbonHeader,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  SkipToContent,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherItem,
  SwitcherDivider,
} from "@carbon/react";

import { Switcher as SwitcherIcon, UserAvatar } from "@carbon/icons-react";
import "../../styles/components/_header.scss";

const Header = () => {
  const location = useLocation();
  const is = (path) => location.pathname === path;
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  
  // Bypass Auth0 in local development
  const isLocalDev = import.meta.env.DEV;
  
  // Switcher panel state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleLogin = () => {
    if (isLocalDev) return; // Skip in dev
    loginWithRedirect();
  };

  const handleLogout = () => {
    if (isLocalDev) return; // Skip in dev
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const NAV = [
    ["Home", "/"],
    ["Research", "/research"],
    ["Insights", "/insights"],
    ["API", "/api"],
  ];

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => {
          const closeNav = () => {
            if (isSideNavExpanded) onClickSideNavExpand(false);
          };

          return (
            <CarbonHeader aria-label="DDR Public Preview">
              <SkipToContent />

              {/* Hamburger toggle */}
              <HeaderMenuButton
                aria-label={isSideNavExpanded ? "Close menu" : "Open menu"}
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
              />

              {/* Brand */}
              <HeaderName as={Link} to="/" prefix="RCA PhD">
                Graham Newman
              </HeaderName>

              {/* ---- MAIN NAV ---- */}
              <HeaderNavigation aria-label="Main navigation">
                {NAV.map(([label, path]) => (
                  <HeaderMenuItem key={path} as={Link} to={path} isActive={is(path)}>
                    {label}
                  </HeaderMenuItem>
                ))}
              </HeaderNavigation>

              {/* App Switcher & User Menu */}
              <HeaderGlobalBar>
                {/* User avatar / login - hide in local dev */}
                {!isLocalDev && (
                  <>
                    {isAuthenticated ? (
                      <HeaderGlobalAction
                        aria-label="Log out"
                        tooltipAlignment="end"
                        onClick={handleLogout}
                      >
                        <UserAvatar size={20} />
                      </HeaderGlobalAction>
                    ) : (
                      <HeaderGlobalAction
                        aria-label="Log in"
                        tooltipAlignment="end"
                        onClick={handleLogin}
                      >
                        <UserAvatar size={20} />
                      </HeaderGlobalAction>
                    )}
                  </>
                )}

                {/* App Switcher */}
                <HeaderGlobalAction
                  aria-label="Switch apps"
                  tooltipAlignment="end"
                  isActive={isSwitcherOpen}
                  onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                >
                  <SwitcherIcon size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>

              {/* Switcher Panel */}
              <HeaderPanel aria-label="App switcher" expanded={isSwitcherOpen}>
                <Switcher>
                  <SwitcherItem
                    href="https://admin.ddrarchive.org"
                    aria-label="Admin site"
                  >
                    Admin
                  </SwitcherItem>
                  <SwitcherItem aria-label="Public (current)" isSelected>
                    Public
                  </SwitcherItem>
                  <SwitcherItem
                    href="#"
                    aria-label="Data portal (coming 2026)"
                  >
                    Data (2026)
                  </SwitcherItem>
                  <SwitcherDivider />
                  <SwitcherItem
                    href="https://api.ddrarchive.org/graphql"
                    target="_blank"
                    aria-label="GraphQL playground"
                  >
                    GraphQL ↗
                  </SwitcherItem>
                </Switcher>
              </HeaderPanel>

              {/* ---- SIDE NAV ---- */}
              <SideNav aria-label="Side navigation" expanded={isSideNavExpanded} isPersistent={false}>
                <SideNavItems>
                  <HeaderSideNavItems>
                    {NAV.map(([label, path]) => (
                      <HeaderMenuItem
                        key={path}
                        as={Link}
                        to={path}
                        isActive={is(path)}
                        onClick={closeNav}
                      >
                        {label}
                      </HeaderMenuItem>
                    ))}
                  </HeaderSideNavItems>
                </SideNavItems>
              </SideNav>
            </CarbonHeader>
          );
        }}
      />
    </Theme>
  );
};

export default Header;
