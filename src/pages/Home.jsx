import { useCallback, useState } from "react";
import { Button, Column, Grid, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Tile } from "@carbon/react";

import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import PageHero from "../components/PageHero/PageHero";

const HOME_LINKS = [
  { id: "overview", label: "Overview" },
  { id: "streams", label: "Public workstreams" },
  { id: "roadmap", label: "Roadmap" },
];

const STREAM_TILES = [
  { id: "taxonomy", label: "Taxonomy refresh", summary: "Surface the vocabulary that underpins the collection so contributors can align language." },
  { id: "model-lab", label: "Model lab", summary: "Demonstrate how systems modelling is translated into public stories and prototypes." },
  { id: "storybank", label: "Story bank", summary: "Publish selected qualitative notes that can be cited by collaborators." },
];

const OVERVIEW_POINTS = [
  { id: "mirror", label: "Mirrors internal IA", summary: "Carries the exact navigation and spacing tokens from the research application so external collaborators build context quickly." },
  { id: "safety", label: "Safe to publish", summary: "Only structural copy ships in this drop. Swap in your own data or decks without exposing internal models." },
  { id: "velocity", label: "Fast to iterate", summary: "Vite + Carbon means every future drop compiles fast and inherits IBM’s accessibility baseline." },
];

const ROADMAP_TABS = [
  {
    id: "context",
    label: "Context",
    eyebrow: "What is this drop?",
    title: "Internal structure, public shell",
    body:
      "The ddr-public build mirrors the navigation and content hierarchy of the internal \"phd research\" application. Each page is intentionally sparse so you can attach your own content or data extracts later.",
  },
  {
    id: "audience",
    label: "Audience",
    eyebrow: "Why surface it?",
    title: "Designed for external partners",
    body:
      "Partners repeatedly asked to see the tooling that shapes our research programmes. This preview gives them an anchor while sensitive data stays inside the parent environment.",
  },
  {
    id: "next",
    label: "Next",
    eyebrow: "What comes next?",
    title: "Extended documentation",
    body:
      "Future drops will include API documentation, richer glossary entries, and safe-to-share metrics. The structure is already in place so those assets can slide in with minimal work.",
  },
];

const Home = () => {
  const [activeHomeTab, setActiveHomeTab] = useState(0);

  const handleHeroTabSelect = useCallback((_, index) => {
    setActiveHomeTab(index);
  }, []);

  const handleHomeTabsChange = useCallback(({ selectedIndex }) => {
    setActiveHomeTab(selectedIndex);
  }, []);

  const handleAnchorSelect = useCallback((_, index) => {
    setActiveHomeTab(index);
  }, []);

  const renderHomePanel = (sectionId) => {
    switch (sectionId) {
      case "overview":
        return (
          <section className="page-section" id="overview">
            <Grid condensed>
              <Column lg={6} md={8} sm={4}>
                <h2>Why surface the shell?</h2>
                <p>
                  Partners asked to see the scaffolding that shapes DDR’s internal work. This view keeps sensitive research inside
                  the parent application while still exposing the information architecture, typography, and pacing.
                </p>
              </Column>
            </Grid>
            <Grid condensed className="tile-grid">
              {OVERVIEW_POINTS.map((point) => (
                <Column key={point.id} lg={4} md={4} sm={4}>
                  <Tile>
                    <p className="eyebrow">{point.label}</p>
                    <p>{point.summary}</p>
                  </Tile>
                </Column>
              ))}
            </Grid>
          </section>
        );
      case "streams":
        return (
          <section className="page-section" id="streams">
            <Grid condensed>
              <Column lg={6} md={8} sm={4}>
                <h2>Public workstreams</h2>
                <p>
                  Each stream corresponds to a full section inside the parent repo. Swap the placeholder copy with live copy decks, attach data visualisations, or connect to a headless CMS.
                </p>
              </Column>
            </Grid>
            <Grid condensed className="tile-grid">
              {STREAM_TILES.map((stream) => (
                <Column key={stream.id} lg={4} md={4} sm={4}>
                  <Tile className="stream-tile">
                    <p className="eyebrow">{stream.label}</p>
                    <p>{stream.summary}</p>
                    <Button size="sm" kind="ghost" href={`/research#${stream.id}`}>
                      View section
                    </Button>
                  </Tile>
                </Column>
              ))}
            </Grid>
          </section>
        );
      case "roadmap":
        return (
          <section className="page-section" id="roadmap">
            <Grid condensed>
              <Column lg={6} md={8} sm={4}>
                <h2>Roadmap</h2>
                <p>The tabs mirror the custom tab component used throughout the parent interface.</p>
              </Column>
            </Grid>
            <Tabs>
              <TabList aria-label="Roadmap tabs">
                {ROADMAP_TABS.map((tab) => (
                  <Tab key={tab.id}>{tab.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {ROADMAP_TABS.map((tab) => (
                  <TabPanel key={`${tab.id}-panel`}>
                    <div className="tab-panel">
                      <p className="eyebrow">{tab.eyebrow}</p>
                      <h3>{tab.title}</h3>
                      <p>{tab.body}</p>
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
    <div className="page home-page">
      <PageHero
        id="overview"
        eyebrow="Department of Design Research"
        title="DDR Public Preview"
        lead="A lightweight frontend that borrows the shape of the internal research application so we can safely collaborate in public."
        tabs={HOME_LINKS}
        activeTab={activeHomeTab}
        onTabSelect={handleHeroTabSelect}
        aside={<AnchorLinks heading="Page map" links={HOME_LINKS} columns={1} onLinkSelect={handleAnchorSelect} />}
      >
        <div className="page-header__actions">
          <Button kind="primary" size="lg" href="/research">
            Explore research
          </Button>
          <Button kind="tertiary" size="lg" href="/insights">
            Jump to insights
          </Button>
          <Button kind="ghost" size="lg" href="/api">
            API sandbox
          </Button>
        </div>
        <div className="tag-row">
          <Tag type="green">Vite</Tag>
          <Tag type="blue">Carbon</Tag>
          <Tag type="magenta">Public beta</Tag>
        </div>
      </PageHero>

      <div className="page-content">
        <Tabs selectedIndex={activeHomeTab} onChange={handleHomeTabsChange}>
          <TabList aria-label="Home sections">
            {HOME_LINKS.map((link) => (
              <Tab key={link.id}>{link.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {HOME_LINKS.map((link) => (
              <TabPanel key={`${link.id}-panel`}>{renderHomePanel(link.id)}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
