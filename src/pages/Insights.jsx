import { useCallback, useState } from "react";
import { Button, Column, Grid, ProgressBar, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Tile } from "@carbon/react";

import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import PageHero from "../components/PageHero/PageHero";

const INSIGHT_LINKS = [
  { id: "systems", label: "Systems" },
  { id: "metrics", label: "Metrics" },
  { id: "next-up", label: "Next up" },
];

const SYSTEM_CARDS = [
  { id: "collection", title: "Collection health", detail: "86% of the collection has aligned descriptors. Placeholder metric until APIs are wired up." },
  { id: "people", title: "People", detail: "12 partner collectives participate in the public programme this quarter." },
  { id: "stories", title: "Stories shipped", detail: "4 narrative prototypes published, 2 in review." },
];

const INSIGHT_TABS = [
  { id: "signals", label: "Signals", content: "Track qualitative signals that bubble up from rehearsals and interviews. Replace this block with Carbon charts or tables later." },
  { id: "models", label: "Models", content: "Drop diagrams, causal loops, or simplified SD models here. Tabs mirror the Carbon system used across the shell." },
  { id: "feedback", label: "Feedback", content: "Threaded partner feedback will live here to keep reviews public." },
];

const METRICS = [
  { id: "alignment", label: "Semantic alignment", value: 72 },
  { id: "access", label: "Access requests", value: 54 },
  { id: "updates", label: "Weekly updates", value: 32 },
];

const Insights = () => {
  const [activeInsightsTab, setActiveInsightsTab] = useState(0);

  const handleHeroTabSelect = useCallback((_, index) => {
    setActiveInsightsTab(index);
  }, []);

  const handleInsightsTabsChange = useCallback(({ selectedIndex }) => {
    setActiveInsightsTab(selectedIndex);
  }, []);

  const handleAnchorSelect = useCallback((_, index) => {
    setActiveInsightsTab(index);
  }, []);

  const renderInsightsPanel = (sectionId) => {
    switch (sectionId) {
      case "systems":
        return (
          <section className="page-section" id="systems">
            <Grid condensed className="tile-grid">
              {SYSTEM_CARDS.map((card) => (
                <Column key={card.id} lg={4} md={4} sm={4}>
                  <Tile>
                    <p className="eyebrow">{card.title}</p>
                    <p>{card.detail}</p>
                    <Tag type="purple">Placeholder</Tag>
                  </Tile>
                </Column>
              ))}
            </Grid>
          </section>
        );
      case "metrics":
        return (
          <section className="page-section" id="metrics">
            <Grid condensed className="metric-grid">
              {METRICS.map((metric) => (
                <Column key={metric.id} lg={4} md={4} sm={4}>
                  <p className="metric-label">{metric.label}</p>
                  <ProgressBar label="" helperText={`${metric.value}%`} value={metric.value} max={100} />
                </Column>
              ))}
            </Grid>
          </section>
        );
      case "next-up":
        return (
          <section className="page-section" id="next-up">
            <Grid condensed>
              <Column lg={8} md={8} sm={4}>
                <h2>What ships next?</h2>
                <p>Tabs showcase how you might stage future insight summaries or embed Carbon charts.</p>
              </Column>
            </Grid>
            <Tabs>
              <TabList aria-label="Insight tabs">
                {INSIGHT_TABS.map((tab) => (
                  <Tab key={tab.id}>{tab.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {INSIGHT_TABS.map((tab) => (
                  <TabPanel key={`${tab.id}-panel`}>
                    <div className="tab-panel">
                      <p className="eyebrow">{tab.label}</p>
                      <p>{tab.content}</p>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page insights-page">
      <PageHero
        id="systems"
        eyebrow="Insights"
        title="Systems snapshot"
        lead="Placeholder analytics wiring so you can attach Carbon charts and cards just like the internal dashboard."
        tabs={INSIGHT_LINKS}
        activeTab={activeInsightsTab}
        onTabSelect={handleHeroTabSelect}
        aside={<AnchorLinks heading="Sections" links={INSIGHT_LINKS} columns={2} onLinkSelect={handleAnchorSelect} />}
      >
        <Button kind="ghost" href="/research">
          Back to research
        </Button>
      </PageHero>

      <div className="page-content">
        <Tabs selectedIndex={activeInsightsTab} onChange={handleInsightsTabsChange}>
          <TabList aria-label="Insights sections">
            {INSIGHT_LINKS.map((link) => (
              <Tab key={link.id}>{link.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {INSIGHT_LINKS.map((link) => (
              <TabPanel key={`${link.id}-panel`}>{renderInsightsPanel(link.id)}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default Insights;
