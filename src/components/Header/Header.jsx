import { Link, useLocation } from "react-router-dom";
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
} from "@carbon/react";

import "../../styles/components/_header.scss";

const Header = () => {
  const location = useLocation();
  const is = (path) => location.pathname === path;

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
