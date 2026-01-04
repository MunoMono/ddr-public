import { useCallback, useState } from "react";
import { Column, Grid, Heading, Theme } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import useMarkdown from "../hooks/useMarkdown";

const RESEARCH_TABS = [
  { id: "workflow", label: "Workflow" },
  { id: "datasets", label: "Datasets" },
  { id: "collaboration", label: "Collaboration" },
];

const WORKFLOW_ANCHORS = [
  { id: "process-overview", label: "Process overview" },
  { id: "data-collection", label: "Data collection" },
  { id: "analysis-methods", label: "Analysis methods" },
  { id: "documentation", label: "Documentation" },
];

const DATASETS_ANCHORS = [
  { id: "available-datasets", label: "Available datasets" },
  { id: "data-structure", label: "Data structure" },
  { id: "access-protocols", label: "Access protocols" },
  { id: "metadata-standards", label: "Metadata standards" },
];

const COLLABORATION_ANCHORS = [
  { id: "partnership-model", label: "Partnership model" },
  { id: "contribution-guidelines", label: "Contribution guidelines" },
  { id: "communication-channels", label: "Communication channels" },
  { id: "licensing-terms", label: "Licensing terms" },
];

const Research = () => {
  const [activeTab, setActiveTab] = useState(0);

  const workflowMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/research/workflow.md`);
  const datasetsMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/research/datasets.md`);
  const collaborationMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/research/collaboration.md`);

  const handleTabSelect = useCallback((_, index) => {
    setActiveTab(index);
  }, []);

  return (
    <div className="page research-page">
      <PageHero
        id="research"
        // eyebrow="Research"
        title="Archive research and development"
        // lead="This page keeps the same anchor layout from the parent repo so you can plug in real sections such as Taxonomy, Data Visualisation, and Modelling."
        tabs={RESEARCH_TABS}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />

      <Theme theme="g10">
        <div className="page-content">
          <section className="page-section" id="main-content">
            <Grid condensed>
              <Column lg={14} md={8} sm={4}>
                {activeTab === 0 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      DDR's research workflow mirrors the internal process so external collaborators can understand how data moves through collection, analysis, and publication stages
                    </Heading>
                    <AnchorLinks links={WORKFLOW_ANCHORS} />
                    <MarkdownContent 
                      html={workflowMd.html} 
                      loading={workflowMd.loading} 
                      error={workflowMd.error} 
                    />
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      Available datasets follow consistent structure and metadata standards with documentation for access protocols and usage guidelines
                    </Heading>
                    <AnchorLinks links={DATASETS_ANCHORS} />
                    <MarkdownContent 
                      html={datasetsMd.html} 
                      loading={datasetsMd.loading} 
                      error={datasetsMd.error} 
                    />
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      Collaboration happens through defined channels with clear contribution guidelines and licensing terms that protect sensitive research
                    </Heading>
                    <AnchorLinks links={COLLABORATION_ANCHORS} />
                    <MarkdownContent 
                      html={collaborationMd.html} 
                      loading={collaborationMd.loading} 
                      error={collaborationMd.error} 
                    />
                  </>
                )}
              </Column>
            </Grid>
          </section>
        </div>
      </Theme>
    </div>
  );
};

export default Research;
