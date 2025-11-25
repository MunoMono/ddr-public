import { useCallback, useState } from "react";
import { Column, Grid } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import useMarkdown from "../hooks/useMarkdown";

const RESEARCH_TABS = [
  { id: "workflow", label: "Workflow" },
  { id: "datasets", label: "Datasets" },
  { id: "collaboration", label: "Collaboration" },
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
        eyebrow="Research"
        title="Shared workflow"
        lead="This page keeps the same anchor layout from the parent repo so you can plug in real sections such as Taxonomy, Data Visualisation, and Modelling."
        tabs={RESEARCH_TABS}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />

      <div className="page-content">
        <section className="page-section" aria-label="Research content">
          <Grid condensed>
            <Column lg={8} md={8} sm={4}>
              {activeTab === 0 && (
                <MarkdownContent 
                  html={workflowMd.html} 
                  loading={workflowMd.loading} 
                  error={workflowMd.error} 
                />
              )}
              {activeTab === 1 && (
                <MarkdownContent 
                  html={datasetsMd.html} 
                  loading={datasetsMd.loading} 
                  error={datasetsMd.error} 
                />
              )}
              {activeTab === 2 && (
                <MarkdownContent 
                  html={collaborationMd.html} 
                  loading={collaborationMd.loading} 
                  error={collaborationMd.error} 
                />
              )}
            </Column>
          </Grid>
        </section>
      </div>
    </div>
  );
};

export default Research;
