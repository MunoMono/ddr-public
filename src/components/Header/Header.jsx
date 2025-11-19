import { Link, useLocation } from "react-router-dom";
import {
  Theme,
  Header as CarbonHeader,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  SkipToContent,
} from "@carbon/react";
import { Notification, Search } from "@carbon/icons-react";

import "../../styles/components/_header.scss";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/" },
  { id: "research", label: "Research", href: "/research" },
  { id: "insights", label: "Insights", href: "/insights" },
  { id: "api", label: "API", href: "/api" },
];

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <CarbonHeader aria-label="DDR Public Preview">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? "Close menu" : "Open menu"}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
            />

            <HeaderName as={Link} to="/" prefix="RCA PhD">
              <span className="label--full">Department of Design Research</span>
              <span className="tablet-name">
                <span>DDR</span>
                <span>Public shell</span>
              </span>
            </HeaderName>

            <HeaderNavigation aria-label="DDR navigation">
              {NAV_ITEMS.map((item) => (
                <HeaderMenuItem
                  key={item.id}
                  as={Link}
                  to={item.href}
                  isActive={isActive(item.href)}
                  className="has-tab"
                >
                  <span className="menu--full">{item.label}</span>
                  <span className="menu--tab">{item.label}</span>
                </HeaderMenuItem>
              ))}
            </HeaderNavigation>

            <HeaderGlobalBar>
              <HeaderGlobalAction aria-label="Search placeholder" tooltipAlignment="end">
                <Search size={20} />
              </HeaderGlobalAction>
              <HeaderGlobalAction aria-label="Notifications placeholder" tooltipAlignment="end">
                <Notification size={20} />
              </HeaderGlobalAction>
            </HeaderGlobalBar>

            <SideNav aria-label="DDR navigation" expanded={isSideNavExpanded} isPersistent={false}>
              <SideNavItems>
                <HeaderSideNavItems>
                  {NAV_ITEMS.map((item) => (
                    <HeaderMenuItem
                      key={`mobile-${item.id}`}
                      as={Link}
                      to={item.href}
                      isActive={isActive(item.href)}
                      onClick={() => onClickSideNavExpand(false)}
                    >
                      {item.label}
                    </HeaderMenuItem>
                  ))}
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          </CarbonHeader>
        )}
      />
    </Theme>
  );
};

export default Header;
