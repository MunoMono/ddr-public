import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Column, Grid, Tab, TabList, TabPanel, TabPanels, Tabs, Theme } from "@carbon/react";

import "../../styles/components/_page-hero.scss";

const clampTabIndex = (index, tabsLength) => {
  if (tabsLength === 0) return 0;
  if (index < 0) return 0;
  if (index >= tabsLength) return tabsLength - 1;
  return index;
};

const PageHero = ({
  id,
  eyebrow,
  title,
  lead,
  children,
  aside,
  asideCols = { lg: 4, md: 8, sm: 4 },
  mainCols,
  tabs = [],
  tabAriaLabel = "Page sections",
  activeTab,
  onTabSelect,
  style,
}) => {
  const [internalIndex, setInternalIndex] = useState(() => clampTabIndex(activeTab ?? 0, tabs.length));
  const hasTabs = tabs.length > 0;
  const isControlled = useMemo(() => typeof activeTab === "number", [activeTab]);
  const resolvedIndex = isControlled ? clampTabIndex(activeTab ?? 0, tabs.length) : internalIndex;

  const handleTabChange = useCallback(
    ({ selectedIndex }) => {
      const nextIndex = clampTabIndex(selectedIndex, tabs.length);
      if (!isControlled) {
        setInternalIndex(nextIndex);
      }

      const selectedTab = tabs[nextIndex];
      if (selectedTab && typeof onTabSelect === "function") {
        onTabSelect(selectedTab, nextIndex);
      }
    },
    [isControlled, onTabSelect, tabs]
  );

  return (
    <Theme theme="g100">
      <div className="page-hero-shell">
        <section className="page-hero" id={id} style={style}>
          <div className="page-hero__inner">
            <Grid condensed className="page-hero__grid">
              <Column
                lg={mainCols?.lg ?? (hasTabs ? 14 : 12)}
                md={mainCols?.md ?? 8}
                sm={mainCols?.sm ?? 4}
              >
                {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
                {title ? <h1>{title}</h1> : null}
                {lead ? <p className="lead">{lead}</p> : null}
                {children}
              </Column>
              {aside ? (
                <Column
                  lg={asideCols.lg ?? 4}
                  md={asideCols.md ?? 8}
                  sm={asideCols.sm ?? 4}
                  className="page-hero__aside"
                >
                  {aside}
                </Column>
              ) : null}
            </Grid>
          </div>
        </section>

        {hasTabs ? (
          <div className="hero-tabs">
            <div className="hero-tabs__inner">
              <Tabs selectedIndex={resolvedIndex} onChange={handleTabChange} scrollIntoView={false}>
                <TabList aria-label={tabAriaLabel}>
                  {tabs.map((tab) => (
                    <Tab key={tab.id}>{tab.label}</Tab>
                  ))}
                </TabList>
                <TabPanels className="hero-tabs__panels">
                  {tabs.map((tab) => (
                    <TabPanel key={`${tab.id}-panel`}>
                      <span className="sr-only">{tab.label}</span>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </div>
          </div>
        ) : null}
      </div>
    </Theme>
  );
};

PageHero.propTypes = {
  id: PropTypes.string,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  lead: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  aside: PropTypes.node,
  asideCols: PropTypes.shape({
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
  }),
  mainCols: PropTypes.shape({
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
  }),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      target: PropTypes.string,
      href: PropTypes.string,
    })
  ),
  tabAriaLabel: PropTypes.string,
  activeTab: PropTypes.number,
  onTabSelect: PropTypes.func,
  style: PropTypes.object,
};

export default PageHero;
