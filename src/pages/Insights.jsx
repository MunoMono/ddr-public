import { useCallback, useState } from "react";
import { Column, Grid, Heading, Theme } from "@carbon/react";
import PageHero from "../components/PageHero/PageHero";
import MarkdownContent from "../components/MarkdownContent/MarkdownContent";
import AnchorLinks from "../components/AnchorLinks/AnchorLinks";
import useMarkdown from "../hooks/useMarkdown";

const INSIGHTS_TABS = [
  { id: "systems", label: "Systems" },
  { id: "next-up", label: "Next up" },
];

const SYSTEMS_ANCHORS = [
  { id: "architecture", label: "Architecture overview" },
  { id: "performance-metrics", label: "Performance metrics" },
  { id: "data-flows", label: "Data flows" },
  { id: "integration-points", label: "Integration points" },
];

const NEXTUP_ANCHORS = [
  { id: "planned-features", label: "Planned features" },
  { id: "research-questions", label: "Research questions" },
  { id: "technical-debt", label: "Technical debt" },
  { id: "community-requests", label: "Community requests" },
];

const Insights = () => {
  const [activeTab, setActiveTab] = useState(0);

  const systemsMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/insights/systems.md`);
  const nextUpMd = useMarkdown(`${import.meta.env.BASE_URL}docs/pages/insights/next-up.md`);

  const handleTabSelect = useCallback((_, index) => {
    setActiveTab(index);
  }, []);

  return (
    <div className="page insights-page">
      <PageHero
        id="insights"
        // eyebrow="Insights"
        title="Research insights"
        // lead="Placeholder analytics wiring so you can attach Carbon charts and cards just like the internal dashboard."
        tabs={INSIGHTS_TABS}
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
                      Systems analytics track architecture performance and data flows with dashboard wiring for Carbon charts showing real metrics from the internal platform
                    </Heading>
                    <AnchorLinks links={SYSTEMS_ANCHORS} />
                    <MarkdownContent 
                      html={systemsMd.html} 
                      loading={systemsMd.loading} 
                      error={systemsMd.error} 
                    />
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <Heading type="heading-03" className="tab-lead">
                      Upcoming work covers planned features, open research questions and technical improvements shaped by community feedback
                    </Heading>
                    <AnchorLinks links={NEXTUP_ANCHORS} />
                    <MarkdownContent 
                      html={nextUpMd.html} 
                      loading={nextUpMd.loading} 
                      error={nextUpMd.error} 
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

export default Insights;
