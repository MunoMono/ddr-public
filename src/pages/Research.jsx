import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Column,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  Tag,
} from "@carbon/react";

import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import PageHero from "../components/PageHero/PageHero";

const RESEARCH_LINKS = [
  { id: "workflow", label: "Workflow" },
  { id: "datasets", label: "Datasets" },
  { id: "collaboration", label: "Collaboration" },
];

const DATA_TABS = [
  {
    id: "qualitative",
    label: "Qualitative",
    description: "Interview fragments, rehearsal notes, and reflective journals staged for qualitative coding.",
  },
  {
    id: "quantitative",
    label: "Quantitative",
    description: "Structured exports that summarise rehearsal durations, participation, and metadata health.",
  },
  {
    id: "models",
    label: "Models",
    description: "System dynamics and knowledge graphs published as simplified diagrams for public review.",
  },
];

const DATASETS = [
  { id: "notes", name: "Field notes", cadence: "Weekly", owner: "DDR Core", status: "Redacted" },
  { id: "catalogue", name: "Catalogue", cadence: "Monthly", owner: "Archive Guild", status: "In sync" },
  { id: "systems", name: "Systems lab", cadence: "Ad hoc", owner: "Model team", status: "Snapshots" },
];

const WORKFLOW_STEPS = [
  {
    id: "intake",
    title: "Intake",
    copy: "Define the public questions to explore before duplicating any sensitive workflows or datasets.",
  },
  {
    id: "experimentation",
    title: "Experimentation",
    copy: "Spin up sandbox components on this shell (charts, cards, short decks) to test storytelling approaches.",
  },
  {
    id: "release",
    title: "Release",
    copy: "Replace placeholder text, update anchors, and publish static builds after research owners sign off.",
  },
];

const COLLAB_PARTNERS = [
  { id: "research", label: "DDR Core" },
  { id: "archive", label: "Archive Guild" },
  { id: "partners", label: "Partner collectives" },
  { id: "model", label: "Model team" },
];

const Research = () => {
  const [activeResearchTab, setActiveResearchTab] = useState(0);

  const handleHeroTabSelect = useCallback((_, index) => {
    setActiveResearchTab(index);
  }, []);

  const handleResearchTabsChange = useCallback(({ selectedIndex }) => {
    setActiveResearchTab(selectedIndex);
  }, []);

  const handleAnchorSelect = useCallback((_, index) => {
    setActiveResearchTab(index);
  }, []);

  const renderResearchPanel = (sectionId) => {
    switch (sectionId) {
      case "workflow":
        return (
          <section className="page-section" id="workflow">
            <Grid condensed>
              <Column lg={8} md={8} sm={4}>
                <h2>Workflow</h2>
                <p>
                  The public track mirrors the internal flow: scope questions with researchers, stage placeholder content, and only then
                  open the door to partners.
                </p>
              </Column>
            </Grid>
            <Accordion>
              {WORKFLOW_STEPS.map((step) => (
                <AccordionItem key={step.id} title={step.title}>
                  {step.copy}
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        );
      case "datasets":
        return (
          <section className="page-section" id="datasets">
            <Grid condensed>
              <Column lg={6} md={8} sm={4}>
                <h2>Dataset overview</h2>
                <p>
                  Tabs, tables, and accordions below ship as placeholders. Use Carbon components to slot in data extracts or API responses when they become available.
                </p>
              </Column>
            </Grid>
            <Tabs>
              <TabList aria-label="Dataset types">
                {DATA_TABS.map((tab) => (
                  <Tab key={tab.id}>{tab.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {DATA_TABS.map((tab) => (
                  <TabPanel key={`${tab.id}-panel`}>
                    <div className="tab-panel">
                      <p className="eyebrow">{tab.label}</p>
                      <p>{tab.description}</p>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
            <StructuredListWrapper className="dataset-list">
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Dataset</StructuredListCell>
                  <StructuredListCell head>Cadence</StructuredListCell>
                  <StructuredListCell head>Owner</StructuredListCell>
                  <StructuredListCell head>Status</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {DATASETS.map((dataset) => (
                  <StructuredListRow key={dataset.id}>
                    <StructuredListCell>{dataset.name}</StructuredListCell>
                    <StructuredListCell>{dataset.cadence}</StructuredListCell>
                    <StructuredListCell>{dataset.owner}</StructuredListCell>
                    <StructuredListCell>
                      <Tag type="cool-gray">{dataset.status}</Tag>
                    </StructuredListCell>
                  </StructuredListRow>
                ))}
              </StructuredListBody>
            </StructuredListWrapper>
          </section>
        );
      case "collaboration":
        return (
          <section className="page-section" id="collaboration">
            <Grid condensed>
              <Column lg={6} md={8} sm={4}>
                <h2>Collaboration model</h2>
                <p>Each partner collective mirrors the same cadence so decisions stay transparent.</p>
              </Column>
              <Column lg={6} md={8} sm={4}>
                <div className="tag-row">
                  {COLLAB_PARTNERS.map((partner) => (
                    <Tag key={partner.id} type="teal">
                      {partner.label}
                    </Tag>
                  ))}
                </div>
              </Column>
            </Grid>
            <p>
              Replace these placeholders with your own partner briefs, API references, or design reviews when you are ready to ship
              public programme notes.
            </p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page research-page">
      <PageHero
        id="workflow"
        eyebrow="Research"
        title="Shared workflow"
        lead="This page keeps the same anchor layout from the parent repo so you can plug in real sections such as Taxonomy, Data Visualisation, and Modelling."
        tabs={RESEARCH_LINKS}
        activeTab={activeResearchTab}
        onTabSelect={handleHeroTabSelect}
        aside={
          <AnchorLinks links={RESEARCH_LINKS} columns={2} heading="Jump to section" onLinkSelect={handleAnchorSelect} />
        }
      />

      <div className="page-content">
        <Tabs selectedIndex={activeResearchTab} onChange={handleResearchTabsChange}>
          <TabList aria-label="Research sections">
            {RESEARCH_LINKS.map((link) => (
              <Tab key={link.id}>{link.label}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {RESEARCH_LINKS.map((link) => (
              <TabPanel key={`${link.id}-panel`}>{renderResearchPanel(link.id)}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default Research;
